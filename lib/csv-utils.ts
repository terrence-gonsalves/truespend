import crypto from 'crypto';

export interface ParsedCSV {
    headers: string[]
    rows: string[][]
    rowCount: number
};

export interface ColumnMapping {
    date: number | null
    description: number | null
    amount: number | null
    category?: number | null
    account?: number | null
    balance?: number | null
};

export interface TransactionRow {
    date: string
    description: string
    amount: number
    category?: string
    account?: string
    isIncome: boolean
    hash: string
};

/**
 * Parse CSV file content
 */
export function parseCSV(content: string): ParsedCSV {
    const lines = content.split('\n').filter(line => line.trim());

    if (lines.length === 0) {
        throw new Error('CSV file is empty');
    }

    const headers = parseCSVLine(lines[0]);
    const rows = lines.slice(1).map(line => parseCSVLine(line));

    return {
        headers,
        rows: rows.filter(row => row.length > 0),
        rowCount: rows.length
    };
}

/**
 * Parse a single CSV line handling quotes and commas
 */
function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current.trim());

    return result;
}

/**
 * Auto-detect column mappings based on common patterns
 */
export function autoDetectColumns(headers: string[]): Partial<ColumnMapping> {
    const mapping: Partial<ColumnMapping> = {};

    const datePatterns = /date|posted|transaction.*date/i;
    const descriptionPatterns = /description|memo|details|merchant|payee/i;
    const amountPatterns = /amount|value|sum|debit|credit/i;
    const categoryPatterns = /category|type|class/i;
    const accountPatterns = /account/i;
    const balancePatterns = /balance/i;

    headers.forEach((header, index) => {
        const cleanHeader = header.toLowerCase().trim();

        if (!mapping.date && datePatterns.test(cleanHeader)) {
            mapping.date = index;
        }

        if (!mapping.description && descriptionPatterns.test(cleanHeader)) {
            mapping.description = index;
        }

        if (!mapping.amount && amountPatterns.test(cleanHeader)) {
            mapping.amount = index;
        }

        if (!mapping.category && categoryPatterns.test(cleanHeader)) {
            mapping.category = index;
        }

        if (!mapping.account && accountPatterns.test(cleanHeader)) {
            mapping.account = index;
        }

        if (!mapping.balance && balancePatterns.test(cleanHeader)) {
            mapping.balance = index;
        }
    })

    return mapping;
}

/**
 * Parse date string to ISO format
 */
export function parseDate(dateStr: string): string | null {
    if (!dateStr) return null;

    // try various date formats
    const formats = [    
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // MM/DD/YYYY         
        /^(\d{4})-(\d{1,2})-(\d{1,2})$/, // YYYY-MM-DD        
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // DD/MM/YYYY
    ];

    for (const format of formats) {
        const match = dateStr.match(format);

        if (match) {
            const date = new Date(dateStr);

            if (!isNaN(date.getTime())) {
                return date.toISOString().split('T')[0];
            }
        }
    }

    // try native Date parsing as fallback
    const date = new Date(dateStr);

    if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
    }

    return null;
}

/**
 * Parse amount string to number
 */
export function parseAmount(amountStr: string): number | null {
    if (!amountStr) return null;

    // remove currency symbols, commas, and whitespace
    const cleaned = amountStr
        .replace(/[$€£¥,\s]/g, '')
        .replace(/[()]/g, '') // remove parentheses (often used for negative)
        .trim();

    // check if amount was in parentheses (negative)
    const isNegative = amountStr.includes('(') && amountStr.includes(')');

    const amount = parseFloat(cleaned);

    if (isNaN(amount)) return null;

    return isNegative ? -Math.abs(amount) : amount;
}

/**
 * Determine if transaction is income based on amount
 */
export function isIncome(amount: number): boolean {
    return amount > 0;
}

/**
 * Generate hash for deduplication
 */
export function generateTransactionHash(
    date: string,
    description: string,
    amount: number
): string {
    const data = `${date}|${description}|${amount}`;

    return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Map CSV rows to transaction objects
 */
export function mapRowsToTransactions(
    rows: string[][],
    mapping: ColumnMapping
): TransactionRow[] {
    const transactions: TransactionRow[] = [];

    for (const row of rows) {
        if (mapping.date === null || mapping.description === null || mapping.amount === null) {
            continue;
        }

        const dateStr = row[mapping.date];
        const description = row[mapping.description];
        const amountStr = row[mapping.amount];

        const date = parseDate(dateStr);
        const amount = parseAmount(amountStr);

        if (!date || amount === null || !description) {
            continue; // skip invalid rows
        }

        const hash = generateTransactionHash(date, description, amount);

        transactions.push({
            date,
            description: description.trim(),
            amount,
            category: mapping.category !== undefined && mapping.category !== null ? row[mapping.category]?.trim() : undefined,
            account: mapping.account !== undefined && mapping.account !== null ? row[mapping.account]?.trim() : undefined,
            isIncome: isIncome(amount),
            hash
        });
    }

    return transactions;
}

/**
 * Validate file size and row count
 */
export function validateCSVFile(file: File): { valid: boolean; error?: string } {
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    
    if (file.size > MAX_FILE_SIZE) {
        return { valid: false, error: 'File size exceeds 10MB limit' };
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
        return { valid: false, error: 'Only CSV files are allowed' };
    }

    return { valid: true };
}

export async function validateRowCount(content: string): Promise<{ valid: boolean; error?: string }> {
    const MAX_ROWS = 50000;
    const lineCount = content.split('\n').filter(line => line.trim()).length - 1; // exclude header

    if (lineCount > MAX_ROWS) {
        return { valid: false, error: `File contains ${lineCount} rows. Maximum allowed is ${MAX_ROWS}` };
    }

    return { valid: true };
}
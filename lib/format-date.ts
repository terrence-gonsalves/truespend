// format a date string (YYYY-MM-DD) as local date without timezone conversion
export function formatLocalDate(dateString: string): string {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    return date.toLocaleDateString();
}
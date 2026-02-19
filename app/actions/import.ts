'use server';

import { createClient } from '@/lib/supabase/server';
import { type ColumnMapping, type TransactionRow } from '@/lib/csv-utils';
import { revalidatePath } from 'next/cache';
import type { Json } from '@/types/supabase';

export async function ensureDefaultCategories() {
    const supabase = await createClient(); 
    const { data: { user } } = await supabase.auth.getUser(); 

    if (!user) {
        throw new Error('Unauthorized'); 
    }

    // Check if user already has categories
    const { data: existingCategories } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', user.id)
        .limit(1); 

    if (existingCategories && existingCategories.length > 0) {
        return; // categories already exist
    }

    // create default system categories
    const defaultCategories = [
        { name: 'Uncategorized', color: '#6B7280', is_system: true },
        { name: 'Income', color: '#10B981', is_system: true },
        { name: 'Transfer', color: '#3B82F6', is_system: true },
        { name: 'Groceries', color: '#F59E0B', is_system: false },
        { name: 'Dining', color: '#EF4444', is_system: false },
        { name: 'Transportation', color: '#8B5CF6', is_system: false },
        { name: 'Shopping', color: '#EC4899', is_system: false },
        { name: 'Entertainment', color: '#14B8A6', is_system: false },
        { name: 'Bills', color: '#F97316', is_system: false },
        { name: 'Healthcare', color: '#06B6D4', is_system: false },
    ];

    const categoriesToInsert = defaultCategories.map(cat => ({
        ...cat,
        user_id: user.id
    }));

    const { error } = await supabase
        .from('categories')
        .insert(categoriesToInsert);

    if (error) {
        console.error('Error creating default categories:', error);

        throw error;
    }
}

export async function getCategories() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    // ensure default categories exist
    await ensureDefaultCategories();

    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .eq('archived', false)
        .order('name');

    if (error) throw error;

    return data;
}

export async function getAccounts() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

    if (error) throw error;

    return data || [];
}

export async function createAccount(name: string, institution?: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    const { data, error } = await supabase
        .from('accounts')
        .insert({
            user_id: user.id,
            name,
            institution
        })
        .select()
        .single();

    if (error) throw error;

    return data;
}

export async function importTransactions(
    transactions: TransactionRow[],
    defaultCategoryId: string | null,
    defaultAccountId: string | null,
    filename: string
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    // get category mappings
    const { data: categories } = await supabase
        .from('categories')
        .select('id, name')
        .eq('user_id', user.id);

    const categoryMap = new Map(categories?.map(c => [c.name.toLowerCase(), c.id]) || []);

    // prepare transactions for insert
    const transactionsToInsert = transactions.map(t => {
        let categoryId = defaultCategoryId;

        // Try to map category by name if provided
        if (t.category) {
            const mappedCategoryId = categoryMap.get(t.category.toLowerCase());

            if (mappedCategoryId) {
                categoryId = mappedCategoryId;
            }
        }

        return {
            user_id: user.id,
            account_id: defaultAccountId,
            date: t.date,
            description: t.description,
            amount: t.amount,
            category_id: categoryId,
            original_category: t.category || null,
            is_income: t.isIncome,
            hash: t.hash
        };
    })

    // insert transactions (will upsert on conflict due to unique index on hash + user_id)
    const { data: insertedTransactions, error: insertError } = await supabase
        .from('transactions')
        .upsert(transactionsToInsert, {
            onConflict: 'hash,user_id',
            ignoreDuplicates: false
        })
        .select();

    if (insertError) {
        console.error('Error inserting transactions:', insertError);

        throw insertError;
    }

    // create import batch record
    const { error: batchError } = await supabase
        .from('import_batches')
        .insert({
            user_id: user.id,
            filename,
            row_count: transactions.length,
            success_count: insertedTransactions?.length || 0,
            error_count: transactions.length - (insertedTransactions?.length || 0)
        });

    if (batchError) {
        console.error('Error creating import batch:', batchError);
    }

    revalidatePath('/transactions');
    revalidatePath('/dashboard');

    return {
        success: true,
        imported: insertedTransactions?.length || 0,
        duplicates: transactions.length - (insertedTransactions?.length || 0)
    };
}

export async function saveColumnMapping(name: string, mapping: ColumnMapping) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    // Convert ColumnMapping to a plain object that matches Json type
    const mappingJson: Record<string, number | null | undefined> = {
        date: mapping.date,
        description: mapping.description,
        amount: mapping.amount,
        category: mapping.category,
        account: mapping.account,
        balance: mapping.balance
    };

    const { data, error } = await supabase
        .from('column_mapping_presets')
        .insert({
            user_id: user.id,
            name,
            mapping: mappingJson as Json
        })
        .select()
        .single();

    if (error) throw error;

    return data;
}

export async function getColumnMappingPresets() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    const { data, error } = await supabase
        .from('column_mapping_presets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
}
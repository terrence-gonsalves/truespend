'use server';

import { createClient } from '@/lib/supabase/server';
import { getUserHousehold } from './household';
import { type ColumnMapping, type TransactionRow } from '@/lib/csv-utils';
import { revalidatePath } from 'next/cache';
import type { Json } from '@/types/supabase';

export async function getCategories() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    // get user's household
    const household = await getUserHousehold();

    // get both default and custom categories
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .or(`household_id.is.null,household_id.eq.${household.id}`)
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

    // get user's household
    const household = await getUserHousehold();

    const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('household_id', household.id)
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

    // get user's household
    const household = await getUserHousehold();

    const { data, error } = await supabase
        .from('accounts')
        .insert({
            user_id: user.id,
            household_id: household.id,
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

    // get user's household
    const household = await getUserHousehold();

    // get category mappings (both default and custom)
    const { data: categories } = await supabase
        .from('categories')
        .select('id, name')
        .or(`household_id.is.null,household_id.eq.${household.id}`);

    const categoryMap = new Map(categories?.map(c => [c.name.toLowerCase(), c.id]) || []);

    // prepare transactions for insert
    const transactionsToInsert = transactions.map(t => {
        let categoryId = defaultCategoryId;

        // try to map category by name if provided
        if (t.category) {
            const mappedCategoryId = categoryMap.get(t.category.toLowerCase());

            if (mappedCategoryId) {
                categoryId = mappedCategoryId;
            }
        }

        return {
            user_id: user.id,
            household_id: household.id,
            account_id: defaultAccountId,
            date: t.date,
            description: t.description,
            amount: t.amount,
            category_id: categoryId,
            original_category: t.category || null,
            is_income: t.isIncome,
            hash: t.hash
        };
    });

    // deduplicate by hash to avoid conflict error
    const uniqueTransactions = Array.from(
        new Map(transactionsToInsert.map(t => [t.hash, t])).values()
    );

    // insert transactions (will upsert on conflict due to unique index on hash + user_id)
    const { data: insertedTransactions, error: insertError } = await supabase
        .from('transactions')
        .upsert(uniqueTransactions, {
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
            household_id: household.id,
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

    // get user's household
    const household = await getUserHousehold();

    // convert ColumnMapping to a plain object that matches Json type
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
            household_id: household.id,
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

    // get user's household
    const household = await getUserHousehold();

    const { data, error } = await supabase
        .from('column_mapping_presets')
        .select('*')
        .eq('household_id', household.id)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
}
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// re-export from import actions for convenience
export { getCategories, getAccounts } from './import';

export interface TransactionFilters {
    dateFrom?: string
    dateTo?: string
    categoryId?: string
    accountId?: string
    transactionType?: 'income' | 'expense' | 'all'
};

export async function getTransactions(
    page: number = 1,
    perPage: number = 25,
    filters?: TransactionFilters
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    let query = supabase
        .from('transactions')
        .select(`
            *,
            category:categories(id, name, color),
            account:accounts(id, name, institution)
            `, { count: 'exact' })
        .eq('user_id', user.id);

    // apply filters
    if (filters?.dateFrom) {
        query = query.gte('date', filters.dateFrom);
    }

    if (filters?.dateTo) {
        query = query.lte('date', filters.dateTo);
    }

    if (filters?.categoryId) {
        query = query.eq('category_id', filters.categoryId);
    }

    if (filters?.accountId) {
        query = query.eq('account_id', filters.accountId);
    }

    if (filters?.transactionType === 'income') {
        query = query.eq('is_income', true);
    } else if (filters?.transactionType === 'expense') {
        query = query.eq('is_income', false);
    }

    // pagination and sorting
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    const { data, error, count } = await query
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) throw error;

    return {
        transactions: data || [],
        count: count || 0,
        page,
        perPage,
        totalPages: Math.ceil((count || 0) / perPage)
    };
}

export async function updateTransaction(
    id: string,
    updates: {
        date?: string
        description?: string
        amount?: number
        category_id?: string | null
        account_id?: string | null
    }
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {;
        throw new Error('Unauthorized');
    }

    const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

    if (error) throw error;

    revalidatePath('/transactions');
    revalidatePath('/dashboard');

    return data;
}

export async function deleteTransaction(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) throw error;

    revalidatePath('/transactions');
    revalidatePath('/dashboard');
}

export async function bulkDeleteTransactions(ids: string[]) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    const { error } = await supabase
        .from('transactions')
        .delete()
        .in('id', ids)
        .eq('user_id', user.id);

    if (error) throw error;

    revalidatePath('/transactions');
    revalidatePath('/dashboard');
}

export async function bulkUpdateCategory(ids: string[], categoryId: string | null) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    const { error } = await supabase
        .from('transactions')
        .update({ category_id: categoryId })
        .in('id', ids)
        .eq('user_id', user.id);

    if (error) throw error;

    revalidatePath('/transactions');
    revalidatePath('/dashboard');
}

export async function bulkUpdateAccount(ids: string[], accountId: string | null) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    const { error } = await supabase
        .from('transactions')
        .update({ account_id: accountId })
        .in('id', ids)
        .eq('user_id', user.id);

    if (error) throw error;

    revalidatePath('/transactions');
    revalidatePath('/dashboard');
}
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getCategoriesWithStats(includeArchived: boolean = false) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    // get categories
    let query = supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

    if (!includeArchived) {
        query = query.eq('archived', false);
    }

    const { data: categories, error } = await query;

    if (error) throw error;

    // Get transaction stats for each category
    const categoriesWithStats = await Promise.all((categories || []).map(async (category) => {
        const { data: transactions } = await supabase
            .from('transactions')
            .select('amount, is_income')
            .eq('user_id', user.id)
            .eq('category_id', category.id);

        const totalSpent = transactions?.reduce((sum, t) => {

            // only count expenses (negative amounts or is_income = false)
            if (t.is_income) return sum;

            return sum + Math.abs(t.amount);
        }, 0) || 0

        const transactionCount = transactions?.length || 0;

        return {
            ...category,
            totalSpent,
            transactionCount
        }
    }));

    return categoriesWithStats;
}

export async function createCategory(name: string, color: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    const { data, error } = await supabase
        .from('categories')
        .insert({
            user_id: user.id,
            name,
            color,
            is_system: false,
            archived: false
        })
        .select()
        .single();

    if (error) throw error;

    revalidatePath('/categories');
    revalidatePath('/transactions');

    return data;
}

export async function updateCategory(id: string, name: string, color: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    // check if category is a system category
    const { data: category } = await supabase
        .from('categories')
        .select('is_system')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

    if (!category) {
        throw new Error('Category not found');
    }

  // if system category, only allow color changes
  const updates = category.is_system 
    ? { color }
    : { name, color };

    const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

    if (error) throw error;

    revalidatePath('/categories');
    revalidatePath('/transactions');

    return data;
}

export async function archiveCategory(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    // check if category is a system category
    const { data: category } = await supabase
        .from('categories')
        .select('is_system')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

    if (!category) {
        throw new Error('Category not found');
    }

    if (category.is_system) {
        throw new Error('Cannot archive system categories');
    }

    const { error } = await supabase
        .from('categories')
        .update({ archived: true })
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) throw error;

    revalidatePath('/categories');
    revalidatePath('/transactions');
}

export async function unarchiveCategory(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    const { error } = await supabase
        .from('categories')
        .update({ archived: false })
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) throw error;

    revalidatePath('/categories');
    revalidatePath('/transactions');
}

export async function deleteCategory(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    // check if category is a system category
    const { data: category } = await supabase
        .from('categories')
        .select('is_system')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

    if (!category) {
        throw new Error('Category not found');
    }

    if (category.is_system) {
        throw new Error('Cannot delete system categories');
    }

    // set transactions to null category before deleting
    await supabase
        .from('transactions')
        .update({ category_id: null })
        .eq('category_id', id)
        .eq('user_id', user.id);

    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) throw error;

    revalidatePath('/categories');
    revalidatePath('/transactions');
}

export async function mergeCategories(fromCategoryId: string, toCategoryId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    // check if target category is valid
    const { data: toCategory } = await supabase
        .from('categories')
        .select('id')
        .eq('id', toCategoryId)
        .eq('user_id', user.id)
        .single();

    if (!toCategory) {
        throw new Error('Target category not found');
    }

    // update all transactions from old category to new category
    const { error: updateError } = await supabase
        .from('transactions')
        .update({ category_id: toCategoryId })
        .eq('category_id', fromCategoryId)
        .eq('user_id', user.id);

    if (updateError) throw updateError;

    // delete the old category (will fail if it's a system category)
    await deleteCategory(fromCategoryId);

    revalidatePath('/categories');
    revalidatePath('/transactions');
}
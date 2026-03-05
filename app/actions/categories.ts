'use server';

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { getUserHousehold } from './household';

export async function getCategories() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    // get user's household
    const household = await getUserHousehold();

    // get both default categories (household_id IS NULL) and household's custom categories
    const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .or(`household_id.is.null,household_id.eq.${household.id}`)
        .eq('archived', false)
        .order('name');

    if (error) throw error;

    return categories || [];
}

export async function getCategoriesWithStats() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    // get user's household
    const household = await getUserHousehold()

    // get both default and custom categories
    const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .or(`household_id.is.null,household_id.eq.${household.id}`)
        .eq('archived', false)
        .order('name');

    if (error) throw error;

    // get transaction stats for each category
    const categoriesWithStats = await Promise.all(
        (categories || []).map(async (category) => {
            const { data: transactions } = await supabase
                .from('transactions')
                .select('amount, is_income')
                .eq('category_id', category.id)
                .eq('household_id', household.id);

            const totalSpent = transactions
                ?.filter(t => !t.is_income)
                .reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0;

            const transactionCount = transactions?.length || 0;

            return {
                ...category,
                totalSpent,
                transactionCount
            };
        })
    );

    return categoriesWithStats;
}

export async function createCategory(name: string, color: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    // get user's household
    const household = await getUserHousehold();

    // create custom category for the household
    const { data, error } = await supabase
        .from('categories')
        .insert({
            name,
            color,
            household_id: household.id, // custom category
            archived: false
        })
        .select()
        .single();

    if (error) throw error;

    return data;
}

export async function updateCategory(id: string, name: string, color: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    // get user's household
    const household = await getUserHousehold();

    // can only update custom categories (with household_id)
    const { error } = await supabase
        .from('categories')
        .update({ name, color })
        .eq('id', id)
        .eq('household_id', household.id); // only custom categories

    if (error) throw error;
}

export async function archiveCategory(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    // get user's household
    const household = await getUserHousehold();

    // can only archive custom categories
    const { error } = await supabase
        .from('categories')
        .update({ archived: true })
        .eq('id', id)
        .eq('household_id', household.id);

    if (error) throw error;
}

export async function unarchiveCategory(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    // get user's household
    const household = await getUserHousehold();

    // can only unarchive custom categories
    const { error } = await supabase
        .from('categories')
        .update({ archived: false })
        .eq('id', id)
        .eq('household_id', household.id);

    if (error) throw error;
}

export async function deleteCategory(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    // get user's household
    const household = await getUserHousehold();

    // can only delete custom categories
    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('household_id', household.id);

    if (error) throw error;
}

export async function mergeCategories(sourceIds: string[], targetId: string) {
    const supabase = await createClient();
    const serviceSupabase = createServiceClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    // get user's household
    const household = await getUserHousehold();

    // verify target category exists and is accessible (default or household's)
    const { data: targetCategory } = await supabase
        .from('categories')
        .select('id, household_id')
        .eq('id', targetId)
        .or(`household_id.is.null,household_id.eq.${household.id}`)
        .single();

    if (!targetCategory) {
        throw new Error('Target category not found or not accessible');
    }

    // update all transactions from source categories to target
    // using service client because we're updating transactions that might have RLS restrictions
    const { error: updateError } = await serviceSupabase
        .from('transactions')
        .update({ category_id: targetId })
        .in('category_id', sourceIds)
        .eq('household_id', household.id);

    if (updateError) throw updateError;

    // delete source categories (only custom ones can be deleted)
    const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .in('id', sourceIds)
        .eq('household_id', household.id); // only delete custom categories

    if (deleteError) throw deleteError;
}

export async function getCategoryStats(categoryId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    // get user's household
    const household = await getUserHousehold();

    // verify category is accessible
    const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('id', categoryId)
        .or(`household_id.is.null,household_id.eq.${household.id}`)
        .single();

    if (!category) {
        throw new Error('Category not found or not accessible');
    }

    // get stats for this category from household's transactions
    const { data: transactions } = await supabase
        .from('transactions')
        .select('amount, is_income')
        .eq('category_id', categoryId)
        .eq('household_id', household.id);

    const totalSpent = transactions
        ?.filter(t => !t.is_income)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0;

    const transactionCount = transactions?.length || 0;

    return {
        totalSpent,
        transactionCount
    };
}
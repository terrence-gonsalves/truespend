'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getBudgetsForMonth(month: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Unauthorized');
    }

    // get all categories for the user
    const { data: categories } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .eq('archived', false)
      .order('name');

    if (!categories) return [];

    // get budgets for the month
    const { data: budgets } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', month);

    // get spending for each category in the month
    const startDate = `${month}-01`;
    const endDate = new Date(new Date(startDate).getFullYear(), new Date(startDate).getMonth() + 1, 0)
        .toISOString()
        .split('T')[0];

    const budgetsWithStats = await Promise.all(
        categories.map(async (category) => {
            const budget = budgets?.find(b => b.category_id === category.id);

            // calculate spending for this category in this month
            const { data: transactions } = await supabase
                .from('transactions')
                .select('amount, is_income')
                .eq('user_id', user.id)
                .eq('category_id', category.id)
                .gte('date', startDate)
                .lte('date', endDate);

            const spent = transactions?.reduce((sum, t) => {

                // only count expenses
                if (t.is_income) return sum;

                return sum + Math.abs(t.amount)
            }, 0) || 0;

            return {
                category,
                budget: budget || null,
                spent,
                remaining: budget ? budget.amount - spent : 0,
                percentage: budget ? (spent / budget.amount) * 100 : 0
            };
        })
    );

    return budgetsWithStats;
}

export async function setBudget(categoryId: string, month: string, amount: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    const { data, error } = await supabase
        .from('budgets')
        .upsert({
            user_id: user.id,
            category_id: categoryId,
            month,
            amount
        }, {
            onConflict: 'user_id,category_id,month'
        })
        .select()
        .single();

    if (error) throw error;

    revalidatePath('/budgets');

    return data;
}

export async function deleteBudget(categoryId: string, month: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('user_id', user.id)
        .eq('category_id', categoryId)
        .eq('month', month);

    if (error) throw error;

    revalidatePath('/budgets');
  }

  export async function getAvailableMonths() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    // get earliest and latest transaction dates
    const { data: transactions } = await supabase
        .from('transactions')
        .select('date')
        .eq('user_id', user.id)
        .order('date', { ascending: true })
        .limit(1);

    const { data: latestTransactions } = await supabase
        .from('transactions')
        .select('date')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(1);

    if (!transactions || transactions.length === 0) {

        // no transactions, return current month only
        const now = new Date();
        return [{
            value: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
            label: now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        }];
    }

    const startDate = new Date(transactions[0].date);
    const endDate = latestTransactions && latestTransactions.length > 0 
        ? new Date(latestTransactions[0].date)
        : new Date();

    // add one month to include future planning
    endDate.setMonth(endDate.getMonth() + 1);

    const months: Array<{ value: string; label: string }> = [];
    const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

    while (current <= endDate) {
        const monthValue = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
        const monthLabel = current.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      
        months.push({ value: monthValue, label: monthLabel });
        
        current.setMonth(current.getMonth() + 1);
    }

    return months.reverse(); // most recent first
}
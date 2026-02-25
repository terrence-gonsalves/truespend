'use server';

import { createClient } from '@/lib/supabase/server';

export async function getDashboardData() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthStart = `${currentMonth}-01`;
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    // last 7 days for trend
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // get current month transactions
    const { data: monthTransactions } = await supabase
        .from('transactions')
        .select('amount, is_income, category_id, categories(name, color)')
        .eq('user_id', user.id)
        .gte('date', monthStart)
        .lte('date', monthEnd);

    // get last 7 days transactions for trend
    const { data: weekTransactions } = await supabase
        .from('transactions')
        .select('date, amount, is_income')
        .eq('user_id', user.id)
        .gte('date', sevenDaysAgo)
        .order('date', { ascending: true });

    // get recent 10 transactions
    const { data: recentTransactions } = await supabase
        .from('transactions')
        .select(`
            *,
            category:categories(id, name, color),
            account:accounts(id, name, institution)
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(10);

    // get budgets for current month
    const { data: budgets } = await supabase
        .from('budgets')
        .select('*, category:categories(name, color)')
        .eq('user_id', user.id)
        .eq('month', currentMonth);

    // calculate summary stats
    const income = monthTransactions?.reduce((sum, t) => 
        t.is_income ? sum + t.amount : sum, 0) || 0;
    const expenses = monthTransactions?.reduce((sum, t) => 
        !t.is_income ? sum + Math.abs(t.amount) : sum, 0) || 0;

    // calculate spending by category
    const categorySpending = new Map<string, { name: string; color: string; amount: number }>();
    
    monthTransactions?.forEach(t => {
        if (t.is_income) return;
        
        // handle category data which may be null or have null fields
        const categoryData = t.categories as { name: string; color: string | null } | null;
        const categoryName = categoryData?.name ?? 'Uncategorized';
        const categoryColor = categoryData?.color ?? '#6B7280';
        
        const current = categorySpending.get(categoryName) || { name: categoryName, color: categoryColor, amount: 0 };

        current.amount += Math.abs(t.amount);
        categorySpending.set(categoryName, current);
    });

    const spendingByCategory = Array.from(categorySpending.values())
        .sort((a, b) => b.amount - a.amount);

    // calculate daily spending for last 7 days
    const dailySpending = new Map<string, number>();

    for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        dailySpending.set(dateStr, 0);
    }

    weekTransactions?.forEach(t => {
        if (t.is_income) return;

        const current = dailySpending.get(t.date) || 0;

        dailySpending.set(t.date, current + Math.abs(t.amount));
    });

    const spendingTrend = Array.from(dailySpending.entries()).map(([date, amount]) => ({
        date,
        amount
    }));

    // calculate budget alerts
    const budgetAlerts = await Promise.all(
        (budgets || [])
            .filter(budget => budget.category_id !== null)
            .map(async (budget) => {
                const { data: transactions } = await supabase
                    .from('transactions')
                    .select('amount, is_income')
                    .eq('user_id', user.id)
                    .eq('category_id', budget.category_id!)
                    .gte('date', monthStart)
                    .lte('date', monthEnd);

                const spent = transactions?.reduce((sum, t) => 
                    !t.is_income ? sum + Math.abs(t.amount) : sum, 0) || 0;
                
                const percentage = (spent / budget.amount) * 100;

                return {
                    category: budget.category,
                    budgetAmount: budget.amount,
                    spent,
                    percentage
                };
            })
    );

    // get top 5 spending categories and any over 80%
    const top5 = budgetAlerts
        .sort((a, b) => b.spent - a.spent)
        .slice(0, 5);
    
    const over80 = budgetAlerts.filter(b => b.percentage >= 80 && !top5.includes(b));
    
    const featuredBudgets = [...over80, ...top5]
        .filter((v, i, a) => a.findIndex(t => t.category?.name === v.category?.name) === i)
        .slice(0, 10);

    return {
        summary: {
            income,
            expenses,
            net: income - expenses
        },
        spendingByCategory,
        spendingTrend,
        recentTransactions: recentTransactions || [],
        budgetAlerts: featuredBudgets
    };
}
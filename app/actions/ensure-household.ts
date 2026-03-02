'use server';

import { createClient } from '@/lib/supabase/server';

export async function ensureUserHousehold() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    // check if user already has a household
    const { data: existingMembership } = await supabase
        .from('household_members')
        .select('household_id')
        .eq('user_id', user.id)
        .single();

    if (existingMembership) {
        return existingMembership.household_id;
    }

    // create household if it doesn't exist
    const { data: inviteCodeData } = await supabase.rpc('generate_invite_code');
    const inviteCode = inviteCodeData as string;

    const { data: newHousehold, error: createError } = await supabase
        .from('households')
        .insert({
        name: 'My Household',
        created_by: user.id,
        invite_code: inviteCode
        })
        .select()
        .single();

    if (createError || !newHousehold) {
        throw createError || new Error('Failed to create household');
    }

    // add user as member
    const { error: memberError } = await supabase
        .from('household_members')
        .insert({
            household_id: newHousehold.id,
            user_id: user.id
        });

    if (memberError) {
        throw memberError;
    }

    return newHousehold.id;
}
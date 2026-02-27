'use server';

import { createClient } from '@/lib/supabase/server';

export async function getUserHousehold() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    // get user's household
    const { data: membership } = await supabase
        .from('household_members')
        .select('household_id, households(id, name, invite_code, created_by)')
        .eq('user_id', user.id)
        .single();

    if (!membership || !membership.households) {
        throw new Error('No household found');
    }

    return membership.households as {
        id: string
        name: string
        invite_code: string | null
        created_by: string | null
    };
}

export async function getHouseholdMembers(householdId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    // verify user is member of this household
    const { data: membership } = await supabase
        .from('household_members')
        .select('id')
        .eq('household_id', householdId)
        .eq('user_id', user.id)
        .single();

    if (!membership) {
        throw new Error('Unauthorized');
    }

    // get all members
    const { data: members } = await supabase
        .from('household_members')
        .select('user_id, joined_at')
        .eq('household_id', householdId)
        .order('joined_at', { ascending: true });

    return members || [];
}

export async function updateHouseholdName(householdId: string, name: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    const { error } = await supabase
        .from('households')
        .update({ name })
        .eq('id', householdId)
        .eq('created_by', user.id);

    if (error) throw error;
}

export async function regenerateInviteCode(householdId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    // call the database function to generate a new code
    const { data, error } = await supabase.rpc('generate_invite_code');

    if (error) throw error;

    const newCode = data as string;

    // update the household with the new code
    const { error: updateError } = await supabase
        .from('households')
        .update({ invite_code: newCode })
        .eq('id', householdId)
        .eq('created_by', user.id);

    if (updateError) throw updateError;

    return newCode;
}

export async function joinHouseholdByCode(inviteCode: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    // find household by invite code
    const { data: household, error: householdError } = await supabase
        .from('households')
        .select('id')
        .eq('invite_code', inviteCode.toUpperCase())
        .single();

    if (householdError || !household) {
        throw new Error('Invalid invite code');
    }

    // check if user is already a member
    const { data: existingMembership } = await supabase
        .from('household_members')
        .select('id')
        .eq('household_id', household.id)
        .eq('user_id', user.id)
        .single();

    if (existingMembership) {
        throw new Error('You are already a member of this household');
    }

    // check if user is already in another household
    const { data: currentMembership } = await supabase
        .from('household_members')
        .select('id')
        .eq('user_id', user.id)
        .single();

    if (currentMembership) {
        throw new Error('You are already in a household. Leave your current household first.');
    }

    // add user to household
    const { error: insertError } = await supabase
        .from('household_members')
        .insert({
            household_id: household.id,
            user_id: user.id
        });

    if (insertError) throw insertError;

    // migrate user's existing data to the household
    await migrateUserDataToHousehold(user.id, household.id);

    return household.id;
}

async function migrateUserDataToHousehold(userId: string, householdId: string) {
    const supabase = await createClient();

    // update all user's data to belong to the household
    await supabase
        .from('transactions')
        .update({ household_id: householdId })
        .eq('user_id', userId);

    await supabase
        .from('categories')
        .update({ household_id: householdId })
        .eq('user_id', userId);

    await supabase
        .from('budgets')
        .update({ household_id: householdId })
        .eq('user_id', userId);

    await supabase
        .from('accounts')
        .update({ household_id: householdId })
        .eq('user_id', userId);

    await supabase
        .from('import_batches')
        .update({ household_id: householdId })
        .eq('user_id', userId);

    await supabase
        .from('column_mapping_presets')
        .update({ household_id: householdId })
        .eq('user_id', userId);
}

export async function leaveHousehold(householdId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    // check if user is the creator
    const { data: household } = await supabase
        .from('households')
        .select('created_by')
        .eq('id', householdId)
        .single();

    if (household?.created_by === user.id) {
        throw new Error('Household creator cannot leave. Transfer ownership or delete the household.');
    }

    // remove user from household
    const { error } = await supabase
        .from('household_members')
        .delete()
        .eq('household_id', householdId)
        .eq('user_id', user.id);

    if (error) throw error;

    // create a new household for the user
    const { data: newHousehold, error: createError } = await supabase
        .from('households')
        .insert({
            name: 'My Household',
            created_by: user.id
        })
        .select()
        .single();

    if (createError || !newHousehold) throw createError;

    // generate invite code
    const { data: inviteCode } = await supabase.rpc('generate_invite_code');
    
    await supabase
        .from('households')
        .update({ invite_code: inviteCode as string })
        .eq('id', newHousehold.id);

    // add user to new household
    await supabase
        .from('household_members')
        .insert({
            household_id: newHousehold.id,
            user_id: user.id
        });

    return newHousehold.id;
}
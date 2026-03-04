'use server';

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

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

    // use service client to find household (bypasses RLS)
    const serviceSupabase = createServiceClient();
    
    // find household by invite code
    const { data: household, error: householdError } = await serviceSupabase
        .from('households')
        .select('id')
        .eq('invite_code', inviteCode.toUpperCase())
        .single();

    if (householdError || !household) {
        throw new Error('Invalid invite code');
    }

    // check if user is already a member of THIS household
    const { data: existingMembership } = await serviceSupabase
        .from('household_members')
        .select('id')
        .eq('household_id', household.id)
        .eq('user_id', user.id)
        .maybeSingle();

    if (existingMembership) {
        throw new Error('You are already a member of this household');
    }

    // check if user is in another household
    const { data: currentMembership } = await serviceSupabase
        .from('household_members')
        .select('household_id, households!inner(id, created_by)')
        .eq('user_id', user.id)
        .maybeSingle();

    if (currentMembership) {

        // get the current household details
        const currentHouseholdId = currentMembership.household_id;
        const currentHousehold = currentMembership.households as { id: string; created_by: string | null };
        
        // check if user is the only member and the creator (solo household)
        const { data: memberCount } = await serviceSupabase
            .from('household_members')
            .select('id', { count: 'exact', head: true })
            .eq('household_id', currentHouseholdId);

        const isOnlyMember = (memberCount as unknown as { count: number })?.count === 1;
        const isCreator = currentHousehold.created_by === user.id;

        if (isOnlyMember && isCreator) {

            // automatically leave and delete the solo household
            await serviceSupabase
                .from('household_members')
                .delete()
                .eq('household_id', currentHouseholdId)
                .eq('user_id', user.id);

            await serviceSupabase
                .from('households')
                .delete()
                .eq('id', currentHouseholdId);
        } else {

            // user is in a household with others - require manual leave
            throw new Error('You are already in a household with other members. Please leave that household first.');
        }   
    }

    // add user to new household
    const { error: insertError } = await serviceSupabase
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
    const serviceSupabase = createServiceClient();

    // update all user's data to belong to the household (using service client)
    await serviceSupabase
        .from('transactions')
        .update({ household_id: householdId })
        .eq('user_id', userId);

    await serviceSupabase
        .from('categories')
        .update({ household_id: householdId })
        .eq('user_id', userId);

    await serviceSupabase
        .from('budgets')
        .update({ household_id: householdId })
        .eq('user_id', userId);

    await serviceSupabase
        .from('accounts')
        .update({ household_id: householdId })
        .eq('user_id', userId);

    await serviceSupabase
        .from('import_batches')
        .update({ household_id: householdId })
        .eq('user_id', userId);

    await serviceSupabase
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

    // Check if user is the creator
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
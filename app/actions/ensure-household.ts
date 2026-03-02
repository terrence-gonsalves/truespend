'use server';

import { createClient } from '@/lib/supabase/server';

export async function ensureUserHousehold() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    // check if user already has a household
    const { data: existingMembership, error: membershipError } = await supabase
        .from('household_members')
        .select('household_id')
        .eq('user_id', user.id)
        .single();

    if (membershipError && membershipError.code !== 'PGRST116') {
        console.error('Error checking membership:', membershipError);
    }

    if (existingMembership) {
        return existingMembership.household_id;
    }

    // generate invite code using the database function
    const { data: inviteCodeData, error: codeError } = await supabase.rpc('generate_invite_code');
  
    if (codeError) {
        console.error('Error generating invite code:', codeError);

        // fallback: generate code in JavaScript if DB function fails
        const fallbackCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        console.log('Using fallback invite code:', fallbackCode);
        
        const { data: newHousehold, error: createError } = await supabase
            .from('households')
            .insert({
                name: 'My Household',
                created_by: user.id,
                invite_code: fallbackCode
            })
            .select()
            .single();

        if (createError || !newHousehold) {
            console.error('Error creating household with fallback:', createError);
            throw createError || new Error('Failed to create household');
        }

        const { error: memberError } = await supabase
            .from('household_members')
            .insert({
                household_id: newHousehold.id,
                user_id: user.id
            });

        if (memberError) {
            console.error('Error adding household member:', memberError);
            throw memberError;
        }

        return newHousehold.id;
    }

    const inviteCode = inviteCodeData as string;

    // Create household
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
        console.error('Error creating household:', createError);
        throw createError || new Error('Failed to create household');
    }

    // Add user as member
    const { error: memberError } = await supabase
        .from('household_members')
        .insert({
            household_id: newHousehold.id,
            user_id: user.id
        });

    if (memberError) {
        console.error('Error adding household member:', memberError);
        throw memberError;
    }

    return newHousehold.id;
}
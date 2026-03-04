'use server';

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function ensureUserHousehold() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    console.log('ensureUserHousehold: User ID:', user.id);

    // check if user already has a household using regular client
    const { data: existingMembership, error: membershipError } = await supabase
        .from('household_members')
        .select('household_id')
        .eq('user_id', user.id)
        .maybeSingle();

    if (membershipError) {
        console.error('Error checking membership:', membershipError);
    }

    if (existingMembership) {
        console.log('User already has household:', existingMembership.household_id);
        return existingMembership.household_id;
    }

    console.log('No household found, creating new one...');

    // use service role client to bypass RLS for creation
    const serviceSupabase = createServiceClient();

    // generate invite code using service client
    const { data: inviteCodeData, error: codeError } = await serviceSupabase.rpc('generate_invite_code');
    
    if (codeError) {
        console.error('Error generating invite code:', codeError);
        throw codeError;
    }

    const inviteCode = inviteCodeData as string;
    console.log('Generated invite code:', inviteCode);

    // create household with service role (bypasses RLS)
    const { data: newHousehold, error: createError } = await serviceSupabase
        .from('households')
        .insert({
            name: 'My Household',
            created_by: user.id,
            invite_code: inviteCode
        })
        .select()
        .single();

    if (createError) {
        console.error('Error creating household:', createError);
        throw createError;
    }

    if (!newHousehold) {
        throw new Error('Failed to create household - no data returned');
    }

    console.log('Created household:', newHousehold.id);

    // add user as member with service role
    const { error: memberError } = await serviceSupabase
        .from('household_members')
        .insert({
            household_id: newHousehold.id,
            user_id: user.id
        });

    if (memberError) {
        console.error('Error adding household member:', memberError);
        throw memberError;
    }

    console.log('Added user to household successfully');
    return newHousehold.id;
}
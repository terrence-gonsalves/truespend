'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
    getUserHousehold, 
    getHouseholdMembers, 
    updateHouseholdName, 
    regenerateInviteCode, 
    joinHouseholdByCode, 
    leaveHousehold 
} from '@/app/actions/household';
import { useToast } from '@/components/ui/toast';

interface Household {
    id: string
    name: string
    invite_code: string | null
    created_by: string | null
};

export function HouseholdSettings() {
    const [household, setHousehold] = useState<Household | null>(null);
    const [members, setMembers] = useState<Array<{ user_id: string; joined_at: string | null }>>([]);
    const [loading, setLoading] = useState(true);
    const [editingName, setEditingName] = useState(false);
    const [householdName, setHouseholdName] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [joiningCode, setJoiningCode] = useState('');
    const [showInvite, setShowInvite] = useState(false);
    const [showJoin, setShowJoin] = useState(false);
    const { showToast } = useToast();

    const loadHousehold = useCallback(async () => {
        setLoading(true);

        try {
            const householdData = await getUserHousehold();
            setHousehold(householdData);
            setHouseholdName(householdData.name);
            setInviteCode(householdData.invite_code || '');

            if (householdData.id) {
                const membersData = await getHouseholdMembers(householdData.id);
                setMembers(membersData);
            }
        } catch (error) {
            console.error('Failed to load household:', error);
            showToast('Failed to load household settings', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        loadHousehold();
    }, [loadHousehold]);

    const handleSaveName = async () => {
        if (!household) return;

        try {
            await updateHouseholdName(household.id, householdName);

            setHousehold({ ...household, name: householdName });
            setEditingName(false);
            showToast('Household name updated', 'success');
        } catch (error) {
            console.error('Failed to update name:', error);
            showToast('Failed to update household name', 'error');
        }
    };

    const handleRegenerateCode = async () => {
        if (!household) return;

        try {
            const newCode = await regenerateInviteCode(household.id);

            setInviteCode(newCode);
            setHousehold({ ...household, invite_code: newCode });
            showToast('New invite code generated', 'success');
        } catch (error) {
            console.error('Failed to regenerate code:', error);
            showToast('Failed to generate new code', 'error');
        }
    };

    const handleJoinHousehold = async () => {
        if (!joiningCode.trim()) {
            showToast('Please enter an invite code', 'warning');

            return;
        }

        try {
            await joinHouseholdByCode(joiningCode.trim());

            showToast('Successfully joined household!', 'success');
            setShowJoin(false);
            setJoiningCode('');
            loadHousehold();
        } catch (error: unknown) {
            console.error('Failed to join household:', error);
            const message = error instanceof Error ? error.message : 'Failed to join household';

            showToast(message, 'error');
        }
    };

    const handleLeaveHousehold = async () => {
        if (!household) return;

        const confirmed = window.confirm(
            'Are you sure you want to leave this household? A new household will be created for you.'
        );

        if (!confirmed) return;

        try {
            await leaveHousehold(household.id);
            
            showToast('Left household successfully', 'success');
            loadHousehold();
        } catch (error: unknown) {
            console.error('Failed to leave household:', error);
            const message = error instanceof Error ? error.message : 'Failed to leave household';

            showToast(message, 'error');
        }
    };

    const copyInviteCode = () => {
        navigator.clipboard.writeText(inviteCode);
        showToast('Invite code copied to clipboard', 'success');
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-sm text-gray-600">Loading household settings...</p>
            </div>
        );
    }

    if (!household) {
        return (
            <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-sm text-gray-600">No household found</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Household Name</h2>
                
                {editingName ? (
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={householdName}
                        onChange={(e) => setHouseholdName(e.target.value)}
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        autoFocus
                    />
                    <button
                        onClick={handleSaveName}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Save
                    </button>
                    <button
                        onClick={() => {
                            setEditingName(false)
                            setHouseholdName(household.name)
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                </div>
                ) : (
                <div className="flex items-center justify-between">
                    <p className="text-xl font-semibold text-gray-900">{household.name}</p>
                    <button
                        onClick={() => setEditingName(true)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                        Edit
                    </button>
                </div>
                )}

            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Members</h2>
                
                <div className="space-y-2">

                    {members.map((member, index) => (
                    <div key={member.user_id} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                        <div>
                            <p className="text-sm font-medium text-gray-900">
                                Member {index + 1}

                                {member.user_id === household.created_by && (
                                <span className="ml-2 text-xs text-blue-600">(Creator)</span>
                                )}

                            </p>
                            <p className="text-xs text-gray-500">
                                Joined {member.joined_at ? new Date(member.joined_at).toLocaleDateString() : 'Unknown'}
                            </p>
                        </div>
                    </div>
                    ))}

                </div>

                <p className="mt-4 text-sm text-gray-600">
                    {members.length} {members.length === 1 ? 'member' : 'members'}
                </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Invite Others</h2>
                
                <p className="text-sm text-gray-600 mb-4">
                    Share this code with your partner or family members so they can join your household.
                </p>

                {showInvite ? (
                <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-900">Invite Code</p>
                                <p className="text-2xl font-bold text-blue-600 mt-1 font-mono">{inviteCode}</p>
                            </div>
                            <button
                                onClick={copyInviteCode}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Copy Code
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleRegenerateCode}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Generate New Code
                        </button>
                        <button
                            onClick={() => setShowInvite(false)}
                            className="text-sm text-gray-600 hover:text-gray-700"
                        >
                            Hide
                        </button>
                    </div>
                </div>
                ) : (
                <button
                    onClick={() => setShowInvite(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Show Invite Code
                </button>
                )}

            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Join Another Household</h2>
                
                <p className="text-sm text-gray-600 mb-4">
                    Have an invite code? Enter it below to join someone else&apos;s household.
                </p>

                {showJoin ? (
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={joiningCode}
                            onChange={(e) => setJoiningCode(e.target.value.toUpperCase())}
                            placeholder="Enter 8-character code"
                            maxLength={8}
                            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-mono uppercase"
                        />
                        <button
                            onClick={handleJoinHousehold}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Join
                        </button>
                        <button
                            onClick={() => {
                            setShowJoin(false)
                            setJoiningCode('')
                            }}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                    </div>
                    
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-xs text-amber-800">
                            <strong>Warning:</strong> You can only be in one household at a time. Joining a new household will leave your current one.
                        </p>
                    </div>
                </div>
                ) : (
                <button
                    onClick={() => setShowJoin(true)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                    Join Household
                </button>
                )}

            </div>
            
            {household.created_by !== members.find(m => m.user_id)?.user_id && (
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Leave Household</h2>
                
                <p className="text-sm text-gray-600 mb-4">
                    If you leave this household, a new household will be created for you.
                </p>

                <button
                    onClick={handleLeaveHousehold}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                    Leave Household
                </button>
            </div>
            )}
            
        </div>
    );
}
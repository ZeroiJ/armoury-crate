'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Tokens {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    membershipId: string;
}

interface Character {
    characterId: string;
    light: number;
    emblemPath: string;
    classType: number;
}

const CLASS_NAMES: Record<number, string> = {
    0: 'Titan',
    1: 'Hunter',
    2: 'Warlock',
};

export default function Dashboard() {
    const router = useRouter();
    const [tokens, setTokens] = useState<Tokens | null>(null);
    const [characters, setCharacters] = useState<Character[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Check for stored auth
        const storedAuth = localStorage.getItem('bungieAuth');

        if (!storedAuth) {
            router.push('/');
            return;
        }

        const auth = JSON.parse(storedAuth) as Tokens;

        // Check if token expired
        if (Date.now() > auth.expiresAt) {
            localStorage.removeItem('bungieAuth');
            router.push('/');
            return;
        }

        setTokens(auth);
        fetchProfile(auth);
    }, [router]);

    async function fetchProfile(auth: Tokens) {
        const apiKey = process.env.NEXT_PUBLIC_BUNGIE_API_KEY;

        if (!apiKey) {
            setError('Missing API Key');
            setLoading(false);
            return;
        }

        try {
            // Fetch linked profiles to get the right membership
            const profilesRes = await fetch(
                `https://www.bungie.net/Platform/Destiny2/254/Profile/${auth.membershipId}/LinkedProfiles/`,
                {
                    headers: {
                        'X-API-Key': apiKey,
                        'Authorization': `Bearer ${auth.accessToken}`,
                    },
                }
            );

            if (!profilesRes.ok) {
                throw new Error(`Failed to fetch profiles: ${profilesRes.status}`);
            }

            const profilesData = await profilesRes.json();
            const profiles = profilesData.Response?.profiles || [];

            if (profiles.length === 0) {
                setError('No Destiny 2 profiles found');
                setLoading(false);
                return;
            }

            // Get the first profile's characters
            const primaryProfile = profiles[0];
            const membershipType = primaryProfile.membershipType;
            const membershipId = primaryProfile.membershipId;

            const charactersRes = await fetch(
                `https://www.bungie.net/Platform/Destiny2/${membershipType}/Profile/${membershipId}/?components=200`,
                {
                    headers: {
                        'X-API-Key': apiKey,
                        'Authorization': `Bearer ${auth.accessToken}`,
                    },
                }
            );

            if (!charactersRes.ok) {
                throw new Error(`Failed to fetch characters: ${charactersRes.status}`);
            }

            const charactersData = await charactersRes.json();
            const characterMap = charactersData.Response?.characters?.data || {};

            const charList: Character[] = Object.values(characterMap).map((char: unknown) => {
                const c = char as Record<string, unknown>;
                return {
                    characterId: c.characterId as string,
                    light: c.light as number,
                    emblemPath: c.emblemPath as string,
                    classType: c.classType as number,
                };
            });

            setCharacters(charList);
            setLoading(false);

        } catch (err) {
            setError(String(err));
            setLoading(false);
        }
    }

    function logout() {
        localStorage.removeItem('bungieAuth');
        router.push('/');
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
                <p>Loading your guardians...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
                <div className="text-center">
                    <p className="text-red-500 mb-4">Error: {error}</p>
                    <button onClick={logout} className="text-blue-400 hover:underline">
                        Logout and try again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Your Guardians</h1>
                    <button
                        onClick={logout}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm"
                    >
                        Logout
                    </button>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {characters.map((char) => (
                        <div
                            key={char.characterId}
                            className="bg-gray-800 rounded-lg overflow-hidden"
                        >
                            <Image
                                src={`https://www.bungie.net${char.emblemPath}`}
                                alt="Character Emblem"
                                width={474}
                                height={96}
                                className="w-full"
                            />
                            <div className="p-4">
                                <h2 className="text-xl font-semibold">
                                    {CLASS_NAMES[char.classType] || 'Unknown'}
                                </h2>
                                <p className="text-yellow-400">
                                    ✦ {char.light}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {tokens && (
                    <div className="mt-8 p-4 bg-gray-800 rounded text-sm text-gray-400">
                        <p>Membership ID: {tokens.membershipId}</p>
                        <p>Token expires: {new Date(tokens.expiresAt).toLocaleString()}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

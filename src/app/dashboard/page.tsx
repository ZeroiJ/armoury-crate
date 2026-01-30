import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { redirect } from 'next/navigation';
import Image from 'next/image';

export const runtime = 'edge';

interface SessionPayload {
    membershipId: string;
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    refreshTokenExpires: number;
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

async function getSession(): Promise<SessionPayload | null> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('bnet_session');

    if (!sessionCookie) {
        return null;
    }

    const secret = new TextEncoder().encode(process.env.BUNGIE_CLIENT_SECRET);

    try {
        const { payload } = await jwtVerify(sessionCookie.value, secret);
        return payload as unknown as SessionPayload;
    } catch {
        return null;
    }
}

async function fetchCharacters(session: SessionPayload): Promise<Character[]> {
    const apiKey = process.env.BUNGIE_API_KEY;

    if (!apiKey) {
        throw new Error('Missing API Key');
    }

    // Fetch linked profiles
    const profilesRes = await fetch(
        `https://www.bungie.net/Platform/Destiny2/254/Profile/${session.membershipId}/LinkedProfiles/`,
        {
            headers: {
                'X-API-Key': apiKey,
                'Authorization': `Bearer ${session.accessToken}`,
            },
        }
    );

    if (!profilesRes.ok) {
        throw new Error(`Failed to fetch profiles: ${profilesRes.status}`);
    }

    const profilesData = await profilesRes.json();
    const profiles = profilesData.Response?.profiles || [];

    if (profiles.length === 0) {
        return [];
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
                'Authorization': `Bearer ${session.accessToken}`,
            },
        }
    );

    if (!charactersRes.ok) {
        throw new Error(`Failed to fetch characters: ${charactersRes.status}`);
    }

    const charactersData = await charactersRes.json();
    const characterMap = charactersData.Response?.characters?.data || {};

    return Object.values(characterMap).map((char: unknown) => {
        const c = char as Record<string, unknown>;
        return {
            characterId: c.characterId as string,
            light: c.light as number,
            emblemPath: c.emblemPath as string,
            classType: c.classType as number,
        };
    });
}

export default async function Dashboard() {
    const session = await getSession();

    if (!session) {
        redirect('/');
    }

    let characters: Character[] = [];
    let error: string | null = null;

    try {
        characters = await fetchCharacters(session);
    } catch (err) {
        error = String(err);
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Your Guardians</h1>
                    {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                    <a
                        href="/api/auth/logout"
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm"
                    >
                        Logout
                    </a>
                </div>

                {error ? (
                    <div className="text-center py-8">
                        <p className="text-red-500 mb-4">Error: {error}</p>
                    </div>
                ) : characters.length === 0 ? (
                    <p className="text-gray-400">No characters found.</p>
                ) : (
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
                )}

                <div className="mt-8 p-4 bg-gray-800 rounded text-sm text-gray-400">
                    <p>Membership ID: {session.membershipId}</p>
                    <p>Token expires: {new Date(session.accessTokenExpires).toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
}

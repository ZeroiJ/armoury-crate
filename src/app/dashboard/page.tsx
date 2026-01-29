import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import Image from 'next/image';

export const runtime = 'edge';

interface Character {
    character_id: string;
    class_type: number;
    light: number;
    emblem_path: string;
    background_path: string;
}

export default async function Dashboard() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
        return <div className="p-10 text-center">Please Log In</div>;
    }

    let characters: Character[] = [];

    try {
        const secretValue = process.env.BUNGIE_CLIENT_SECRET;
        if (!secretValue) {
            console.error("Missing BUNGIE_CLIENT_SECRET");
            // In production, force a logout or show error without crashing
            return <div className="p-10 text-center text-red-400">System Error: Missing Configuration</div>;
        }
        const secret = new TextEncoder().encode(secretValue);
        const { payload } = await jwtVerify(sessionCookie.value, secret);
        // Cast generic payload to expected type
        characters = payload.characters as Character[];
    } catch (e) {
        console.error("Session verification failed", e);
        return <div className="p-10 text-red-500">Session Invalid</div>;
    }

    const BUNGIE_ROOT = 'https://www.bungie.net';

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <h1 className="text-3xl font-bold mb-8">Armoury Crate Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {characters.map((char) => (
                    <div key={char.character_id} className="relative h-24 rounded-lg overflow-hidden border border-gray-700 shadow-lg">
                        {/* Background Image */}
                        <div className="absolute inset-0">
                            <Image
                                src={`${BUNGIE_ROOT}${char.background_path}`}
                                alt="Character Background"
                                fill
                                className="object-cover opacity-80"
                            />
                        </div>

                        {/* Content Overlay */}
                        <div className="absolute inset-0 flex items-center p-4 bg-gradient-to-r from-black/80 to-transparent">
                            <div className="relative w-12 h-12 mr-4">
                                <Image
                                    src={`${BUNGIE_ROOT}${char.emblem_path}`}
                                    alt="Emblem"
                                    width={48}
                                    height={48}
                                    className="rounded-sm"
                                />
                            </div>
                            <div>
                                <div className="font-bold text-lg">
                                    {getClass(char.class_type)}
                                </div>
                                <div className="text-yellow-400 font-mono">
                                    ✦ {char.light}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 text-sm text-gray-500">
                Powered by Next.js & Gleam Core
            </div>
        </div>
    );
}

function getClass(type: number): string {
    switch (type) {
        case 0: return 'Titan';
        case 1: return 'Hunter';
        case 2: return 'Warlock';
        default: return 'Guardian';
    }
}

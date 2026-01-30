'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Ported from DIM: src/app/bungie-api/oauth.ts
const TOKEN_URL = 'https://www.bungie.net/platform/app/oauth/token/';

interface Tokens {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    membershipId: string;
}

function AuthReturnContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState('Authorizing...');

    useEffect(() => {
        async function handleAuthReturn() {
            const code = searchParams.get('code');

            if (!code) {
                setError("No authorization code received from Bungie.");
                return;
            }

            setStatus('Exchanging code for tokens...');

            try {
                // Get credentials from environment
                const clientId = process.env.NEXT_PUBLIC_BUNGIE_CLIENT_ID;

                if (!clientId) {
                    setError('Missing Bungie Client ID in environment.');
                    return;
                }

                // Public OAuth clients don't use client_secret
                const body = new URLSearchParams({
                    grant_type: 'authorization_code',
                    code,
                    client_id: clientId,
                });

                const response = await fetch(TOKEN_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: body.toString(),
                    credentials: 'omit',
                });

                if (!response.ok) {
                    const text = await response.text();
                    console.error('Bungie token error:', text);
                    setError(`Bungie rejected the request (${response.status}): ${text}`);
                    return;
                }

                const data = await response.json();

                const tokens: Tokens = {
                    accessToken: data.access_token,
                    refreshToken: data.refresh_token,
                    expiresAt: Date.now() + (data.expires_in * 1000),
                    membershipId: data.membership_id,
                };

                localStorage.setItem('bungieAuth', JSON.stringify(tokens));

                setStatus('Success! Redirecting to dashboard...');
                router.push('/dashboard');

            } catch (err) {
                setError(`Unexpected error: ${String(err)}`);
            }
        }

        handleAuthReturn();
    }, [searchParams, router]);

    return (
        <div className="text-center">
            {error ? (
                <div>
                    <h1 className="text-2xl font-bold text-red-500 mb-4">Authorization Error</h1>
                    <p className="text-gray-400 mb-8">{error}</p>
                    {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                    <a href="/" className="text-blue-400 hover:underline">
                        Go back and try again
                    </a>
                </div>
            ) : (
                <div>
                    <h1 className="text-2xl font-bold mb-4">Validating Authorization</h1>
                    <p className="text-gray-400">{status}</p>
                </div>
            )}
        </div>
    );
}

export default function AuthReturn() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-24 text-white">
            <Suspense fallback={<p>Loading...</p>}>
                <AuthReturnContent />
            </Suspense>
        </div>
    );
}

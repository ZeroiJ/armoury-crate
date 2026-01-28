export const BUNGIE_AUTH_URL = 'https://www.bungie.net/Platform/App/OAuth/token/';
export const BUNGIE_API_ROOT = 'https://www.bungie.net/Platform';

export interface BungieTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    refresh_expires_in: number;
    membership_id: string;
}

export interface BungieCommonResponse<T> {
    Response: T;
    ErrorCode: number;
    ThrottleSeconds: number;
    ErrorStatus: string;
    Message: string;
    MessageData: Record<string, string>;
}

export async function getTokensFromCode(code: string): Promise<BungieTokenResponse> {
    const clientId = process.env.BUNGIE_CLIENT_ID;
    const clientSecret = process.env.BUNGIE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error("Missing Bungie Credentials");
    }

    const body = new URLSearchParams();
    body.append('grant_type', 'authorization_code');
    body.append('code', code);
    body.append('client_id', clientId);
    body.append('client_secret', clientSecret);

    const response = await fetch(BUNGIE_AUTH_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to fetch tokens: ${response.status} ${text}`);
    }

    const data = await response.json();

    // Bungie returns the token directly, unlike API calls which are wrapped in 'Response' object?
    // According to docs, OAuth token endpoint returns standard OAuth2 JSON.
    return data as BungieTokenResponse;
}

export async function getLinkedProfiles(accessToken: string, membershipId: string): Promise<unknown> {
    const response = await fetch(`${BUNGIE_API_ROOT}/Destiny2/254/Profile/${membershipId}/LinkedProfiles/`, {
        method: 'GET',
        headers: {
            'X-API-Key': process.env.BUNGIE_API_KEY || '',
            'Authorization': `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to fetch linked profiles: ${response.status} ${text}`);
    }

    const json = await response.json() as BungieCommonResponse<unknown>;

    if (json.ErrorCode !== 1) {
        throw new Error(`Bungie API Error: ${json.Message}`);
    }

    return json.Response;
}

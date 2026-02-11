function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
}

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });
}

// POST /api/auth { password }
export async function onRequestPost(context) {
    const { env, request } = context;

    let body;
    try {
        body = await request.json();
    } catch {
        return json({ error: 'Invalid JSON body' }, 400);
    }

    const { password } = body;

    if (!password) {
        return json({ error: 'Password required' }, 400);
    }

    if (password !== env.AUTH_PASSWORD) {
        return json({ error: 'Invalid password' }, 401);
    }

    // Generate random token
    const tokenBytes = new Uint8Array(32);
    crypto.getRandomValues(tokenBytes);
    const token = Array.from(tokenBytes).map(b => b.toString(16).padStart(2, '0')).join('');

    // Store in KV with 24-hour TTL
    await env.WOTC_DATA.put(`auth_${token}`, 'valid', { expirationTtl: 86400 });

    return json({ success: true, token });
}

// Handle CORS preflight
export async function onRequestOptions() {
    return new Response(null, { status: 204, headers: corsHeaders() });
}

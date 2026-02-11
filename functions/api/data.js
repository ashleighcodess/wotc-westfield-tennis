const VALID_TYPES = ['events', 'programs', 'posts', 'announcements', 'products'];

function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
}

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });
}

async function validateAuth(request, env) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
    const token = authHeader.slice(7);
    const stored = await env.WOTC_DATA.get(`auth_${token}`);
    return stored === 'valid';
}

// GET /api/data?type=events
export async function onRequestGet(context) {
    const { env, request } = context;
    const url = new URL(request.url);
    const type = url.searchParams.get('type');

    if (!type || !VALID_TYPES.includes(type)) {
        return json({ error: 'Invalid type. Use: ' + VALID_TYPES.join(', ') }, 400);
    }

    const data = await env.WOTC_DATA.get(type);
    return json(data ? JSON.parse(data) : []);
}

// POST /api/data { type, action, data, id }
export async function onRequestPost(context) {
    const { env, request } = context;

    const authed = await validateAuth(request, env);
    if (!authed) {
        return json({ error: 'Unauthorized' }, 401);
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return json({ error: 'Invalid JSON body' }, 400);
    }

    const { type, action, data, id } = body;

    if (!type || !VALID_TYPES.includes(type)) {
        return json({ error: 'Invalid type' }, 400);
    }

    const existing = await env.WOTC_DATA.get(type);
    let items = existing ? JSON.parse(existing) : [];

    switch (action) {
        case 'create': {
            if (!data) return json({ error: 'Missing data' }, 400);
            const prefix = type.substring(0, 3);
            const newItem = {
                ...data,
                id: `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                createdAt: new Date().toISOString(),
            };
            items.unshift(newItem);
            await env.WOTC_DATA.put(type, JSON.stringify(items));
            return json({ success: true, item: newItem });
        }

        case 'update': {
            if (!id || !data) return json({ error: 'Missing id or data' }, 400);
            const index = items.findIndex(item => item.id === id);
            if (index === -1) return json({ error: 'Item not found' }, 404);
            items[index] = { ...items[index], ...data, updatedAt: new Date().toISOString() };
            await env.WOTC_DATA.put(type, JSON.stringify(items));
            return json({ success: true, item: items[index] });
        }

        case 'delete': {
            if (!id) return json({ error: 'Missing id' }, 400);
            const before = items.length;
            items = items.filter(item => item.id !== id);
            if (items.length === before) return json({ error: 'Item not found' }, 404);
            await env.WOTC_DATA.put(type, JSON.stringify(items));
            return json({ success: true });
        }

        case 'save': {
            // Bulk save - replace entire collection
            if (!Array.isArray(data)) return json({ error: 'Data must be an array' }, 400);
            await env.WOTC_DATA.put(type, JSON.stringify(data));
            return json({ success: true });
        }

        default:
            return json({ error: 'Invalid action. Use: create, update, delete, save' }, 400);
    }
}

// Handle CORS preflight
export async function onRequestOptions() {
    return new Response(null, { status: 204, headers: corsHeaders() });
}

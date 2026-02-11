function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };
}

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });
}

const defaults = {
    events: [
        {
            id: 'evt-001',
            title: 'Spring Tennis Mixer & Social',
            date: '2026-03-15',
            time: '10:00 AM - 2:00 PM',
            description: 'Kick off the spring season with our biggest social event! Mixed doubles round-robin, brunch, and prizes.',
            price: 45,
            capacity: 48,
            registered: 24,
            category: 'social',
            stripeLink: '',
            featured: true,
            visible: true,
            createdAt: '2025-01-15T10:00:00Z'
        },
        {
            id: 'evt-002',
            title: 'Serve & Volley Clinic',
            date: '2026-03-08',
            time: '9:00 AM - 11:00 AM',
            description: 'Master the art of serve and volley with Coach Lexi.',
            price: 35,
            capacity: 12,
            registered: 4,
            category: 'clinic',
            stripeLink: '',
            featured: false,
            visible: true,
            createdAt: '2025-01-15T10:00:00Z'
        },
        {
            id: 'evt-003',
            title: 'Doubles Tournament',
            date: '2026-03-22',
            time: '8:00 AM - 4:00 PM',
            description: 'Competitive doubles tournament for 3.5+ level players.',
            price: 60,
            capacity: 24,
            registered: 12,
            category: 'tournament',
            stripeLink: '',
            featured: false,
            visible: true,
            createdAt: '2025-01-15T10:00:00Z'
        }
    ],
    programs: [
        {
            id: 'prg-001',
            title: 'Foundations Clinic',
            level: 'beginner',
            schedule: 'Tuesdays & Thursdays',
            time: '9:00 AM - 10:30 AM',
            description: 'Build your tennis fundamentals.',
            price: 35,
            priceType: 'per session',
            maxPlayers: 8,
            stripeLink: '',
            visible: true,
            createdAt: '2025-01-10T10:00:00Z'
        },
        {
            id: 'prg-002',
            title: 'Stroke Development',
            level: 'intermediate',
            schedule: 'Mondays & Wednesdays',
            time: '10:00 AM - 11:30 AM',
            description: 'Refine your technique and develop consistency.',
            price: 45,
            priceType: 'per session',
            maxPlayers: 6,
            stripeLink: '',
            visible: true,
            createdAt: '2025-01-10T10:00:00Z'
        },
        {
            id: 'prg-003',
            title: 'Private Lesson',
            level: 'all',
            schedule: 'By Appointment',
            time: '60 minutes',
            description: 'One-on-one instruction tailored to your goals.',
            price: 85,
            priceType: 'per session',
            maxPlayers: 1,
            stripeLink: '',
            visible: true,
            createdAt: '2025-01-10T10:00:00Z'
        }
    ],
    posts: [
        {
            id: 'post-001',
            title: 'Spring Schedule Released',
            type: 'announcement',
            content: 'Our spring program schedule is now available! Check out new clinic times, league options, and special events planned for March through May.',
            videoUrl: '',
            affiliateLinks: [],
            author: 'Marcy Borr',
            visible: true,
            createdAt: '2025-01-28T10:00:00Z'
        },
        {
            id: 'post-002',
            title: 'Court Resurfacing Complete',
            type: 'news',
            content: 'Great news! Courts 3 and 4 have been freshly resurfaced and are ready for play. Enjoy the improved bounce and grip!',
            videoUrl: '',
            affiliateLinks: [],
            author: 'Marcy Borr',
            visible: true,
            createdAt: '2025-01-25T10:00:00Z'
        },
        {
            id: 'post-003',
            title: 'Winter Warm-Up Routine',
            type: 'tip',
            content: "Cold muscles need extra care! Here's Coach Lexi's favorite 10-minute warm-up routine to prevent injuries during winter play.",
            videoUrl: '',
            author: 'Lexi Borr',
            visible: true,
            createdAt: '2025-01-22T10:00:00Z'
        }
    ],
    announcements: [
        {
            id: 'ann-001',
            title: 'Spring Registration Now Open!',
            content: 'Sign up for our March events.',
            link: '/events.html',
            linkText: 'View Events',
            type: 'banner',
            visible: true,
            createdAt: '2025-01-15T10:00:00Z'
        }
    ],
    products: [
        {
            id: 'prod-001',
            title: 'WOTC Performance Tee',
            category: 'apparel',
            description: 'Moisture-wicking fabric with embroidered logo.',
            price: 35,
            salePrice: null,
            image: '',
            stripeLink: '',
            featured: true,
            visible: true,
            createdAt: '2025-01-15T10:00:00Z'
        },
        {
            id: 'prod-002',
            title: 'WOTC Tennis Skirt',
            category: 'apparel',
            description: 'Flattering A-line cut with built-in shorts.',
            price: 48,
            salePrice: null,
            image: '',
            stripeLink: '',
            featured: false,
            visible: true,
            createdAt: '2025-01-15T10:00:00Z'
        },
        {
            id: 'prod-003',
            title: 'Penn Championship Balls',
            category: 'equipment',
            description: 'Extra duty felt. 3-pack.',
            price: 4.99,
            salePrice: null,
            image: '',
            stripeLink: '',
            featured: false,
            visible: true,
            createdAt: '2025-01-15T10:00:00Z'
        }
    ]
};

// POST /api/seed - Seed KV with default data (only if empty)
export async function onRequestPost(context) {
    const { env } = context;

    // Check if data already exists
    const existing = await env.WOTC_DATA.get('events');
    if (existing) {
        return json({ success: true, message: 'Data already seeded' });
    }

    // Seed all collections
    const types = Object.keys(defaults);
    await Promise.all(
        types.map(type => env.WOTC_DATA.put(type, JSON.stringify(defaults[type])))
    );

    return json({ success: true, message: 'Default data seeded', types });
}

// Handle CORS preflight
export async function onRequestOptions() {
    return new Response(null, { status: 204, headers: corsHeaders() });
}

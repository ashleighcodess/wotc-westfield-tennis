/**
 * WOTC Public Site Data Reader
 * Reads content from localStorage (synced with dashboard)
 */

const SiteData = {
    // Storage keys (must match dashboard data.js)
    KEYS: {
        events: 'wotc_events',
        programs: 'wotc_programs',
        posts: 'wotc_posts',
        announcements: 'wotc_announcements',
        products: 'wotc_products'
    },

    // Default data (same as dashboard, used if localStorage is empty)
    defaults: {
        events: [
            {
                id: 'evt-001',
                title: 'Spring Tennis Mixer & Social',
                date: '2025-03-15',
                time: '10:00 AM - 2:00 PM',
                description: 'Kick off the spring season with our biggest social event! Mixed doubles round-robin, brunch, and prizes.',
                price: 45,
                capacity: 48,
                registered: 24,
                category: 'social',
                stripeLink: '',
                featured: true,
                visible: true
            },
            {
                id: 'evt-002',
                title: 'Serve & Volley Clinic',
                date: '2025-03-08',
                time: '9:00 AM - 11:00 AM',
                description: 'Master the art of serve and volley with Coach Lexi.',
                price: 35,
                capacity: 12,
                registered: 4,
                category: 'clinic',
                stripeLink: '',
                featured: false,
                visible: true
            },
            {
                id: 'evt-003',
                title: "Women's Doubles Tournament",
                date: '2025-03-22',
                time: '8:00 AM - 4:00 PM',
                description: 'Competitive doubles tournament for 3.5+ level players.',
                price: 60,
                capacity: 24,
                registered: 12,
                category: 'tournament',
                stripeLink: '',
                featured: false,
                visible: true
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
                visible: true
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
                visible: true
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
                visible: true
            }
        ],
        posts: [
            {
                id: 'post-001',
                title: 'Spring Schedule Released',
                type: 'announcement',
                content: 'Our spring program schedule is now available! Check out new clinic times, league options, and special events planned for March through May.',
                videoUrl: '',
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
                visible: true
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
                stripeLink: '',
                featured: true,
                visible: true
            },
            {
                id: 'prod-002',
                title: 'WOTC Tennis Skirt',
                category: 'apparel',
                description: 'Flattering A-line cut with built-in shorts.',
                price: 48,
                salePrice: null,
                stripeLink: '',
                featured: false,
                visible: true
            },
            {
                id: 'prod-003',
                title: 'Penn Championship Balls',
                category: 'equipment',
                description: 'Extra duty felt. 3-pack.',
                price: 4.99,
                salePrice: null,
                stripeLink: '',
                featured: false,
                visible: true
            }
        ]
    },

    // Initialize with defaults if localStorage is empty
    init() {
        Object.keys(this.KEYS).forEach(type => {
            if (!localStorage.getItem(this.KEYS[type])) {
                localStorage.setItem(this.KEYS[type], JSON.stringify(this.defaults[type]));
            }
        });
    },

    // Get all visible items of a type
    getAll(type) {
        // Initialize if needed
        if (!localStorage.getItem(this.KEYS[type])) {
            this.init();
        }
        const data = localStorage.getItem(this.KEYS[type]);
        const items = data ? JSON.parse(data) : [];
        return items.filter(item => item.visible !== false);
    },

    // Get single item by ID
    getById(type, id) {
        const data = localStorage.getItem(this.KEYS[type]);
        const items = data ? JSON.parse(data) : [];
        return items.find(item => item.id === id && item.visible !== false);
    },

    // ============ EVENTS ============
    events: {
        getAll() { return SiteData.getAll('events'); },
        getUpcoming() {
            return this.getAll()
                .filter(e => new Date(e.date) >= new Date())
                .sort((a, b) => new Date(a.date) - new Date(b.date));
        },
        getFeatured() {
            return this.getAll().find(e => e.featured) || this.getUpcoming()[0];
        },
        getByCategory(category) {
            return this.getAll().filter(e => e.category === category);
        }
    },

    // ============ PROGRAMS ============
    programs: {
        getAll() { return SiteData.getAll('programs'); },
        getByLevel(level) {
            return this.getAll().filter(p => p.level === level);
        }
    },

    // ============ POSTS ============
    posts: {
        getAll() { return SiteData.getAll('posts'); },
        getRecent(count = 3) {
            return this.getAll()
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, count);
        },
        getByType(type) {
            return this.getAll().filter(p => p.type === type);
        }
    },

    // ============ ANNOUNCEMENTS ============
    announcements: {
        getAll() { return SiteData.getAll('announcements'); },
        getActive() {
            return this.getAll();
        }
    },

    // ============ PRODUCTS ============
    products: {
        getAll() { return SiteData.getAll('products'); },
        getByCategory(category) {
            return this.getAll().filter(p => p.category === category);
        },
        getFeatured() {
            return this.getAll().filter(p => p.featured);
        }
    },

    // ============ UTILITY FUNCTIONS ============

    // Format date for display
    formatDate(dateStr) {
        const date = new Date(dateStr);
        return {
            day: date.getDate(),
            month: date.toLocaleDateString('en-US', { month: 'short' }),
            monthLong: date.toLocaleDateString('en-US', { month: 'long' }),
            year: date.getFullYear(),
            full: date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        };
    },

    // Format price
    formatPrice(price) {
        if (price === 0) return 'Free';
        return '$' + parseFloat(price).toFixed(price % 1 === 0 ? 0 : 2);
    },

    // Get relative date
    getRelativeDate(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    },

    // Category display name
    getCategoryLabel(category) {
        const labels = {
            tournament: 'Tournament',
            social: 'Social',
            clinic: 'Clinic',
            league: 'League',
            beginner: 'Beginner',
            intermediate: 'Intermediate',
            advanced: 'Advanced',
            all: 'All Levels',
            apparel: 'Apparel',
            equipment: 'Equipment',
            accessories: 'Accessories',
            announcement: 'Announcement',
            news: 'News',
            tip: 'Tip'
        };
        return labels[category] || category;
    }
};

// Make available globally
window.SiteData = SiteData;

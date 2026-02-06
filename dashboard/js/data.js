/**
 * WOTC Dashboard Data Manager
 * Handles CRUD operations for all content types
 * Uses localStorage for browser-based storage (can be swapped for API calls in production)
 */

const WOTCData = {
    // Storage keys
    KEYS: {
        events: 'wotc_events',
        programs: 'wotc_programs',
        posts: 'wotc_posts',
        announcements: 'wotc_announcements',
        products: 'wotc_products'
    },

    // Default data (loaded on first run)
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
                visible: true,
                createdAt: new Date().toISOString()
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
                visible: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'evt-003',
                title: 'Women\'s Doubles Tournament',
                date: '2025-03-22',
                time: '8:00 AM - 4:00 PM',
                description: 'Competitive doubles tournament for 3.5+ level players.',
                price: 60,
                capacity: 24,
                registered: 12,
                category: 'tournament',
                stripeLink: '',
                featured: false,
                visible: true,
                createdAt: new Date().toISOString()
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
                createdAt: new Date().toISOString()
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
                createdAt: new Date().toISOString()
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
                createdAt: new Date().toISOString()
            }
        ],
        posts: [
            {
                id: 'post-001',
                title: 'Spring Schedule Released',
                type: 'announcement',
                content: 'Our spring program schedule is now available!',
                videoUrl: '',
                affiliateLinks: [],
                author: 'Marcy Borr',
                visible: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'post-002',
                title: 'Court Resurfacing Complete',
                type: 'news',
                content: 'Courts 3 and 4 have been freshly resurfaced.',
                videoUrl: '',
                affiliateLinks: [],
                author: 'Marcy Borr',
                visible: true,
                createdAt: new Date().toISOString()
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
                createdAt: new Date().toISOString()
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
                createdAt: new Date().toISOString()
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
                createdAt: new Date().toISOString()
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
                createdAt: new Date().toISOString()
            }
        ]
    },

    // Initialize data (load from storage or use defaults)
    init() {
        Object.keys(this.KEYS).forEach(type => {
            if (!localStorage.getItem(this.KEYS[type])) {
                localStorage.setItem(this.KEYS[type], JSON.stringify(this.defaults[type]));
            }
        });
        console.log('WOTC Data initialized');
    },

    // Generate unique ID
    generateId(prefix) {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },

    // ============ GENERIC CRUD OPERATIONS ============

    // Get all items of a type
    getAll(type) {
        const data = localStorage.getItem(this.KEYS[type]);
        return data ? JSON.parse(data) : [];
    },

    // Get single item by ID
    getById(type, id) {
        const items = this.getAll(type);
        return items.find(item => item.id === id);
    },

    // Create new item
    create(type, data) {
        const items = this.getAll(type);
        const prefix = type.substring(0, 3);
        const newItem = {
            ...data,
            id: this.generateId(prefix),
            createdAt: new Date().toISOString()
        };
        items.unshift(newItem); // Add to beginning
        localStorage.setItem(this.KEYS[type], JSON.stringify(items));
        return newItem;
    },

    // Update existing item
    update(type, id, data) {
        const items = this.getAll(type);
        const index = items.findIndex(item => item.id === id);
        if (index !== -1) {
            items[index] = { ...items[index], ...data, updatedAt: new Date().toISOString() };
            localStorage.setItem(this.KEYS[type], JSON.stringify(items));
            return items[index];
        }
        return null;
    },

    // Delete item
    delete(type, id) {
        const items = this.getAll(type);
        const filtered = items.filter(item => item.id !== id);
        localStorage.setItem(this.KEYS[type], JSON.stringify(filtered));
        return filtered.length < items.length;
    },

    // Toggle visibility
    toggleVisibility(type, id) {
        const item = this.getById(type, id);
        if (item) {
            return this.update(type, id, { visible: !item.visible });
        }
        return null;
    },

    // ============ EVENTS ============

    events: {
        getAll() { return WOTCData.getAll('events'); },
        getById(id) { return WOTCData.getById('events', id); },
        create(data) { return WOTCData.create('events', { ...data, registered: 0 }); },
        update(id, data) { return WOTCData.update('events', id, data); },
        delete(id) { return WOTCData.delete('events', id); },
        toggleVisibility(id) { return WOTCData.toggleVisibility('events', id); },
        getUpcoming() {
            return this.getAll()
                .filter(e => e.visible && new Date(e.date) >= new Date())
                .sort((a, b) => new Date(a.date) - new Date(b.date));
        },
        getByCategory(category) {
            return this.getAll().filter(e => e.category === category);
        }
    },

    // ============ PROGRAMS ============

    programs: {
        getAll() { return WOTCData.getAll('programs'); },
        getById(id) { return WOTCData.getById('programs', id); },
        create(data) { return WOTCData.create('programs', data); },
        update(id, data) { return WOTCData.update('programs', id, data); },
        delete(id) { return WOTCData.delete('programs', id); },
        toggleVisibility(id) { return WOTCData.toggleVisibility('programs', id); },
        getByLevel(level) {
            return this.getAll().filter(p => p.level === level);
        }
    },

    // ============ POSTS (Blog/Updates) ============

    posts: {
        getAll() { return WOTCData.getAll('posts'); },
        getById(id) { return WOTCData.getById('posts', id); },
        create(data) { return WOTCData.create('posts', { ...data, author: 'Marcy Borr' }); },
        update(id, data) { return WOTCData.update('posts', id, data); },
        delete(id) { return WOTCData.delete('posts', id); },
        toggleVisibility(id) { return WOTCData.toggleVisibility('posts', id); },
        getByType(type) {
            return this.getAll().filter(p => p.type === type);
        },
        getVisible() {
            return this.getAll().filter(p => p.visible);
        }
    },

    // ============ ANNOUNCEMENTS ============

    announcements: {
        getAll() { return WOTCData.getAll('announcements'); },
        getById(id) { return WOTCData.getById('announcements', id); },
        create(data) { return WOTCData.create('announcements', data); },
        update(id, data) { return WOTCData.update('announcements', id, data); },
        delete(id) { return WOTCData.delete('announcements', id); },
        toggleVisibility(id) { return WOTCData.toggleVisibility('announcements', id); },
        getActive() {
            return this.getAll().filter(a => a.visible);
        }
    },

    // ============ PRODUCTS ============

    products: {
        getAll() { return WOTCData.getAll('products'); },
        getById(id) { return WOTCData.getById('products', id); },
        create(data) { return WOTCData.create('products', data); },
        update(id, data) { return WOTCData.update('products', id, data); },
        delete(id) { return WOTCData.delete('products', id); },
        toggleVisibility(id) { return WOTCData.toggleVisibility('products', id); },
        getByCategory(category) {
            return this.getAll().filter(p => p.category === category);
        },
        getFeatured() {
            return this.getAll().filter(p => p.featured && p.visible);
        }
    },

    // ============ STATS ============

    getStats() {
        const events = this.events.getAll();
        const programs = this.programs.getAll();
        const posts = this.posts.getAll();
        const products = this.products.getAll();

        const upcomingEvents = events.filter(e => e.visible && new Date(e.date) >= new Date());
        const totalRegistrations = events.reduce((sum, e) => sum + (e.registered || 0), 0);

        return {
            totalEvents: upcomingEvents.length,
            totalPrograms: programs.filter(p => p.visible).length,
            totalPosts: posts.filter(p => p.visible).length,
            totalProducts: products.filter(p => p.visible).length,
            totalRegistrations: totalRegistrations,
            estimatedRevenue: events.reduce((sum, e) => sum + (e.price * (e.registered || 0)), 0)
        };
    },

    // ============ RESET DATA ============

    resetAll() {
        Object.keys(this.KEYS).forEach(type => {
            localStorage.setItem(this.KEYS[type], JSON.stringify(this.defaults[type]));
        });
        console.log('All data reset to defaults');
    },

    // Export all data (for backup)
    exportAll() {
        const data = {};
        Object.keys(this.KEYS).forEach(type => {
            data[type] = this.getAll(type);
        });
        return JSON.stringify(data, null, 2);
    },

    // Import data (from backup)
    importAll(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            Object.keys(this.KEYS).forEach(type => {
                if (data[type]) {
                    localStorage.setItem(this.KEYS[type], JSON.stringify(data[type]));
                }
            });
            return true;
        } catch (e) {
            console.error('Import failed:', e);
            return false;
        }
    }
};

// Initialize on load
WOTCData.init();

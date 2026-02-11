/**
 * WOTC Dashboard Data Manager
 * Uses local cache + API sync pattern
 * Reads are synchronous from cache, writes sync to server in background
 */

const WOTCData = {
    // Local cache (replaces localStorage)
    _cache: {
        events: [],
        programs: [],
        posts: [],
        announcements: [],
        products: []
    },

    _ready: false,

    // Get auth token from sessionStorage
    _getToken() {
        return sessionStorage.getItem('wotc_auth_token') || '';
    },

    // API helper for reads
    async _apiFetch(type) {
        const res = await fetch(`/api/data?type=${type}`);
        if (!res.ok) throw new Error(`Failed to fetch ${type}`);
        return res.json();
    },

    // API helper for writes (requires auth)
    async _apiWrite(type, action, data, id) {
        const body = { type, action };
        if (data !== undefined) body.data = data;
        if (id !== undefined) body.id = id;

        const res = await fetch('/api/data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this._getToken()}`
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            console.error('API write failed:', err);
            if (res.status === 401) {
                sessionStorage.removeItem('wotc_auth_token');
                sessionStorage.removeItem('wotc_authenticated');
                window.location.href = 'index.html';
            }
            throw new Error(err.error || 'API write failed');
        }

        return res.json();
    },

    // Initialize: fetch all data from API into cache
    async init() {
        const types = Object.keys(this._cache);
        const results = await Promise.all(types.map(t => this._apiFetch(t)));
        types.forEach((type, i) => {
            this._cache[type] = results[i] || [];
        });
        this._ready = true;
        console.log('WOTC Data initialized from API');
    },

    // Generate unique ID (used as fallback, server also generates)
    generateId(prefix) {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },

    // ============ GENERIC CRUD OPERATIONS ============

    getAll(type) {
        return this._cache[type] || [];
    },

    getById(type, id) {
        const items = this.getAll(type);
        return items.find(item => item.id === id);
    },

    create(type, data) {
        // Optimistic: add to cache immediately with temp ID
        const prefix = type.substring(0, 3);
        const newItem = {
            ...data,
            id: this.generateId(prefix),
            createdAt: new Date().toISOString()
        };
        this._cache[type].unshift(newItem);

        // Sync to server
        this._apiWrite(type, 'create', data).then(res => {
            if (res.item) {
                // Replace temp item with server-generated one
                const idx = this._cache[type].findIndex(i => i.id === newItem.id);
                if (idx !== -1) this._cache[type][idx] = res.item;
            }
        }).catch(err => console.error('Sync create failed:', err));

        return newItem;
    },

    update(type, id, data) {
        const items = this.getAll(type);
        const index = items.findIndex(item => item.id === id);
        if (index !== -1) {
            items[index] = { ...items[index], ...data, updatedAt: new Date().toISOString() };
            this._apiWrite(type, 'update', data, id)
                .catch(err => console.error('Sync update failed:', err));
            return items[index];
        }
        return null;
    },

    delete(type, id) {
        const items = this.getAll(type);
        const filtered = items.filter(item => item.id !== id);
        const deleted = filtered.length < items.length;
        if (deleted) {
            this._cache[type] = filtered;
            this._apiWrite(type, 'delete', undefined, id)
                .catch(err => console.error('Sync delete failed:', err));
        }
        return deleted;
    },

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

    // ============ EXPORT/IMPORT ============

    exportAll() {
        const data = {};
        Object.keys(this._cache).forEach(type => {
            data[type] = this.getAll(type);
        });
        return JSON.stringify(data, null, 2);
    },

    importAll(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            Object.keys(this._cache).forEach(type => {
                if (data[type]) {
                    this._cache[type] = data[type];
                    this._apiWrite(type, 'save', data[type])
                        .catch(err => console.error('Import sync failed for', type, err));
                }
            });
            return true;
        } catch (e) {
            console.error('Import failed:', e);
            return false;
        }
    }
};

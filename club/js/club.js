/**
 * Westfield Indoor Tennis Club - Site JavaScript
 * Tab filtering, mobile nav, smooth scroll
 */

(function() {
    'use strict';

    // ========== MOBILE NAV TOGGLE ==========
    const mobileToggle = document.querySelector('.mobile-toggle');
    const nav = document.querySelector('nav');

    if (mobileToggle && nav) {
        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('open');
            nav.classList.toggle('open');
        });

        // Close nav when clicking a link
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileToggle.classList.remove('open');
                nav.classList.remove('open');
            });
        });
    }

    // ========== TAB FILTERING ==========
    document.querySelectorAll('.filter-tabs').forEach(tabGroup => {
        const tabs = tabGroup.querySelectorAll('.filter-tab');
        const panelContainer = tabGroup.nextElementSibling;

        if (!panelContainer) return;

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.getAttribute('data-tab');

                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Show matching panel
                panelContainer.querySelectorAll('.tab-panel').forEach(panel => {
                    panel.classList.remove('active');
                    if (panel.getAttribute('data-panel') === target) {
                        panel.classList.add('active');
                    }
                });
            });
        });
    });

    // ========== SMOOTH SCROLL FOR ANCHOR LINKS ==========
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

})();

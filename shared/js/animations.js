/**
 * Tennis Together - Micro Animations
 * Scroll-triggered reveals with IntersectionObserver
 * and scroll progress bar
 */

(function() {
    'use strict';

    // ========== SCROLL-TRIGGERED REVEALS ==========
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    });

    // Observe all [data-animate] elements
    document.querySelectorAll('[data-animate]').forEach(el => {
        observer.observe(el);
    });

    // ========== AUTO-STAGGER GRID CHILDREN ==========
    document.querySelectorAll('[data-stagger]').forEach(container => {
        const children = container.children;
        for (let i = 0; i < children.length; i++) {
            if (!children[i].hasAttribute('data-animate')) {
                children[i].setAttribute('data-animate', 'fade-up');
            }
            children[i].setAttribute('data-delay', Math.min(i + 1, 6));
            observer.observe(children[i]);
        }
    });

    // ========== SCROLL PROGRESS BAR ==========
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.prepend(progressBar);

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight > 0) {
            progressBar.style.width = (scrollTop / docHeight * 100) + '%';
        }
    }, { passive: true });

    // ========== STAT COUNTER PULSE ==========
    // Add pulse class when counters finish animating
    document.querySelectorAll('[data-target]').forEach(counter => {
        const mo = new MutationObserver(() => {
            const target = parseInt(counter.getAttribute('data-target'));
            const current = parseInt(counter.textContent);
            if (current === target) {
                counter.classList.add('stat-pulse');
                mo.disconnect();
            }
        });
        mo.observe(counter, { childList: true, characterData: true, subtree: true });
    });
})();

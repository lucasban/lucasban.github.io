// Photo Gallery - Fetches from Bluesky
(function() {
    const BLUESKY_HANDLE = 'lucasban.com';
    const API_URL = `https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=${BLUESKY_HANDLE}&limit=100`;
    const FETCH_TIMEOUT = 15000; // 15 seconds

    const gallery = document.getElementById('gallery');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.getElementById('lightbox-close');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');
    const emptyMessage = document.getElementById('empty-message');
    const errorMessage = document.getElementById('error-message');
    const loadingMessage = document.getElementById('loading-message');

    let images = [];
    let currentIndex = 0;
    let lastFocusedElement = null;
    let hadError = false;

    // Fetch photos from Bluesky
    async function fetchBlueskyPhotos() {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

        try {
            if (loadingMessage) loadingMessage.style.display = 'block';
            if (emptyMessage) emptyMessage.style.display = 'none';
            if (errorMessage) errorMessage.style.display = 'none';

            const response = await fetch(API_URL, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (!response.ok) throw new Error('Failed to fetch');

            const data = await response.json();
            const photos = [];

            // Extract images from posts
            for (const item of data.feed) {
                const post = item.post;

                // Skip reposts
                if (item.reason) continue;

                // Check for image embeds
                if (post.embed && post.embed.$type === 'app.bsky.embed.images#view') {
                    for (const image of post.embed.images) {
                        photos.push({
                            thumb: image.thumb,
                            full: image.fullsize,
                            alt: image.alt || 'Photo from Bluesky',
                            postUri: post.uri
                        });
                    }
                }

                // Check for images in recordWithMedia embeds
                if (post.embed && post.embed.$type === 'app.bsky.embed.recordWithMedia#view') {
                    if (post.embed.media && post.embed.media.$type === 'app.bsky.embed.images#view') {
                        for (const image of post.embed.media.images) {
                            photos.push({
                                thumb: image.thumb,
                                full: image.fullsize,
                                alt: image.alt || 'Photo from Bluesky',
                                postUri: post.uri
                            });
                        }
                    }
                }
            }

            return photos;
        } catch (error) {
            clearTimeout(timeoutId);
            hadError = true;
            if (error.name === 'AbortError') {
                console.error('Request timed out while fetching Bluesky photos');
            } else {
                console.error('Error fetching Bluesky photos:', error);
            }
            return [];
        }
    }

    // Render photos to gallery
    function renderGallery(photos) {
        if (loadingMessage) loadingMessage.style.display = 'none';

        if (photos.length === 0) {
            if (hadError) {
                if (errorMessage) errorMessage.style.display = 'block';
            } else {
                if (emptyMessage) emptyMessage.style.display = 'block';
            }
            return;
        }

        gallery.innerHTML = photos.map(photo => `
            <img src="${photo.thumb}"
                 data-full="${photo.full}"
                 alt="${photo.alt}"
                 loading="lazy"
                 tabindex="0"
                 role="button">
        `).join('');

        initLightbox();
    }

    // Initialize lightbox functionality
    function initLightbox() {
        images = Array.from(gallery.querySelectorAll('img'));

        if (images.length === 0) return;

        // Add click and keyboard handlers to images
        images.forEach((img, index) => {
            img.addEventListener('click', () => openLightbox(index));
            img.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openLightbox(index);
                }
            });
        });

        // Lightbox controls
        closeBtn.addEventListener('click', closeLightbox);
        prevBtn.addEventListener('click', showPrev);
        nextBtn.addEventListener('click', showNext);

        // Keyboard support for lightbox buttons
        [closeBtn, prevBtn, nextBtn].forEach(btn => {
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    btn.click();
                }
            });
        });

        // Click outside to close
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', handleKeyboard);
    }

    function openLightbox(index) {
        lastFocusedElement = document.activeElement;
        currentIndex = index;
        updateLightboxImage();
        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        // Focus the close button when lightbox opens
        closeBtn.focus();
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        // Restore focus to the element that opened the lightbox
        if (lastFocusedElement) {
            lastFocusedElement.focus();
        }
    }

    function updateLightboxImage() {
        const img = images[currentIndex];
        const fullSrc = img.dataset.full || img.src;
        lightboxImg.src = fullSrc;
        lightboxImg.alt = img.alt;

        // Update nav visibility
        prevBtn.style.visibility = currentIndex > 0 ? 'visible' : 'hidden';
        nextBtn.style.visibility = currentIndex < images.length - 1 ? 'visible' : 'hidden';
    }

    function showPrev() {
        if (currentIndex > 0) {
            currentIndex--;
            updateLightboxImage();
        }
    }

    function showNext() {
        if (currentIndex < images.length - 1) {
            currentIndex++;
            updateLightboxImage();
        }
    }

    function handleKeyboard(e) {
        if (!lightbox.classList.contains('active')) return;

        switch (e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                showPrev();
                break;
            case 'ArrowRight':
                showNext();
                break;
            case 'Tab':
                // Trap focus within lightbox
                trapFocus(e);
                break;
        }
    }

    function trapFocus(e) {
        const focusableElements = [closeBtn, prevBtn, nextBtn].filter(
            el => el.style.visibility !== 'hidden'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
    }

    // Initialize
    async function init() {
        const photos = await fetchBlueskyPhotos();
        renderGallery(photos);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

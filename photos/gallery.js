/**
 * Photo Gallery Logic
 * Fetches images from Bluesky (AT Protocol) and renders a responsive grid with lightbox.
 */
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

    /** @type {Array<{thumb: string, full: string, alt: string, postUri: string}>} */
    let images = [];
    let currentIndex = 0;
    /** @type {HTMLElement|null} */
    let lastFocusedElement = null;
    let hadError = false;

    /**
     * Fetch photos from Bluesky API.
     * @returns {Promise<Array<{thumb: string, full: string, alt: string, postUri: string}>>}
     */
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

    /**
     * Render skeleton placeholders while loading.
     */
    function renderSkeletons() {
        if (gallery) {
            gallery.innerHTML = Array(12).fill(0).map(() => `
                <div class="skeleton" style="height: 180px; width: 100%;"></div>
            `).join('');
        }
    }

    /**
     * Render photos to gallery grid.
     * @param {Array<{thumb: string, full: string, alt: string, postUri: string}>} photos 
     */
    function renderGallery(photos) {
        if (loadingMessage) loadingMessage.style.display = 'none';

        if (photos.length === 0) {
            if (hadError) {
                if (errorMessage) errorMessage.style.display = 'block';
                if (gallery) gallery.innerHTML = '';
            } else {
                if (emptyMessage) emptyMessage.style.display = 'block';
                if (gallery) gallery.innerHTML = '';
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

    // ... (rest of the functions)

    // Initialize
    async function init() {
        // Reset state
        hadError = false;
        
        // Show skeletons and hide old messages
        if (loadingMessage) loadingMessage.style.display = 'none'; // Replaced by skeletons
        if (emptyMessage) emptyMessage.style.display = 'none';
        if (errorMessage) errorMessage.style.display = 'none';
        renderSkeletons();
        
        const photos = await fetchBlueskyPhotos();
        renderGallery(photos);

        // Setup retry link if it exists
        const retryLink = document.getElementById('retry-link');
        if (retryLink) {
            retryLink.addEventListener('click', (e) => {
                e.preventDefault();
                init();
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
// Photo Gallery - Fetches from Bluesky
(function() {
    const BLUESKY_HANDLE = 'lucasban.com';
    const API_URL = `https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=${BLUESKY_HANDLE}&limit=100`;

    const gallery = document.getElementById('gallery');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.getElementById('lightbox-close');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');
    const emptyMessage = document.getElementById('empty-message');
    const loadingMessage = document.getElementById('loading-message');

    let images = [];
    let currentIndex = 0;

    // Fetch photos from Bluesky
    async function fetchBlueskyPhotos() {
        try {
            if (loadingMessage) loadingMessage.style.display = 'block';
            if (emptyMessage) emptyMessage.style.display = 'none';

            const response = await fetch(API_URL);
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
            console.error('Error fetching Bluesky photos:', error);
            return [];
        }
    }

    // Render photos to gallery
    function renderGallery(photos) {
        if (loadingMessage) loadingMessage.style.display = 'none';

        if (photos.length === 0) {
            if (emptyMessage) emptyMessage.style.display = 'block';
            return;
        }

        gallery.innerHTML = photos.map(photo => `
            <img src="${photo.thumb}"
                 data-full="${photo.full}"
                 alt="${photo.alt}"
                 loading="lazy">
        `).join('');

        initLightbox();
    }

    // Initialize lightbox functionality
    function initLightbox() {
        images = Array.from(gallery.querySelectorAll('img'));

        if (images.length === 0) return;

        // Add click handlers to images
        images.forEach((img, index) => {
            img.addEventListener('click', () => openLightbox(index));
        });

        // Lightbox controls
        closeBtn.addEventListener('click', closeLightbox);
        prevBtn.addEventListener('click', showPrev);
        nextBtn.addEventListener('click', showNext);

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
        currentIndex = index;
        updateLightboxImage();
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
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

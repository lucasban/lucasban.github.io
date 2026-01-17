// Photo Gallery with Lightbox
(function() {
    const gallery = document.getElementById('gallery');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.getElementById('lightbox-close');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');
    const emptyMessage = document.getElementById('empty-message');

    let images = [];
    let currentIndex = 0;

    // Initialize gallery
    function init() {
        images = Array.from(gallery.querySelectorAll('img'));

        if (images.length === 0) {
            emptyMessage.style.display = 'block';
            return;
        }

        emptyMessage.style.display = 'none';

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

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

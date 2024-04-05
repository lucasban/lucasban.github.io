document.addEventListener('DOMContentLoaded', function() {
    // Initialize page with default language
    var currentLang = 'en';
    updateLanguage(currentLang);

    document.getElementById('toggle-lang').addEventListener('click', function() {
        currentLang = (currentLang === 'en') ? 'es' : 'en';
        updateLanguage(currentLang);
    });

    function updateLanguage(lang) {
        document.querySelectorAll('.lang').forEach(function(element) {
            if (lang === 'en') {
                if (element.tagName === 'BUTTON' || element.tagName === 'H1') {
                    element.textContent = element.dataset.en;
                } else {
                    element.innerHTML = element.dataset.en;
                }
            } else {
                if (element.tagName === 'BUTTON' || element.tagName === 'H1') {
                    element.textContent = element.dataset.es;
                } else {
                    element.innerHTML = element.dataset.es;
                }
            }
        });
    }

    var subscribeButton = document.getElementById('subscribe-button');
    subscribeButton.addEventListener('click', function() {
        var message = (currentLang === 'en') ?
            'To complete your subscription, please visit our office to make the payment in person.' :
            'Para completar tu suscripción, por favor visita nuestra oficina para realizar el pago en persona.';
        alert(message);
    });
});

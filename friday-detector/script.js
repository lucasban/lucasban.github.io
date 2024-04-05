document.addEventListener('DOMContentLoaded', function() {
    var currentLang = 'en';
    updateLanguage(currentLang); // Call on initial load

    document.getElementById('toggle-lang').addEventListener('click', function() {
        currentLang = (currentLang === 'en') ? 'es' : 'en';
        updateLanguage(currentLang);
    });

    function updateLanguage(lang) {
        document.querySelectorAll('[data-en], [data-es]').forEach(function(element) {
            element.textContent = element.dataset[lang];
        });
    }

    var subscribeButton = document.getElementById('subscribe-button');
    subscribeButton.addEventListener('click', function() {
        var message = currentLang === 'en' ?
            'To complete your subscription, please visit our office to make the payment in person.' :
            'Para completar tu suscripción, por favor visita nuestra oficina para realizar el pago en persona.';
        alert(message);
    });
});

document.addEventListener('DOMContentLoaded', function() {
    var currentLang = 'en'; // Default language
    updateLanguage(currentLang); // Update language on initial load

    // Listen for clicks on the language toggle button
    document.getElementById('toggle-lang').addEventListener('click', function() {
        // Toggle the current language between English and Spanish
        currentLang = (currentLang === 'en') ? 'es' : 'en';
        updateLanguage(currentLang); // Update page content to the new language
    });

    function updateLanguage(lang) {
        // Select all elements with the 'lang' class
        document.querySelectorAll('.lang').forEach(function(element) {
            // Update the text content based on the current language selection
            if (element.tagName === 'INPUT' || element.tagName === 'BUTTON') {
                // For input buttons, update the value attribute
                element.value = element.dataset[lang];
            } else {
                // For other elements, update the text content directly
                element.textContent = element.dataset[lang];
            }
        });
    }

    // Event listener for the subscribe button
    var subscribeButton = document.getElementById('subscribe-button');
    subscribeButton.addEventListener('click', function() {
        // Display a message based on the current language
        var message = currentLang === 'en' ?
            'To complete your subscription, please visit our office to make the payment in person.' :
            'Para completar tu suscripción, por favor visita nuestra oficina para realizar el pago en persona.';
        alert(message);
    });
});

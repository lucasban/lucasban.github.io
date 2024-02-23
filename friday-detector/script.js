document.addEventListener('DOMContentLoaded', function() {
    var today = new Date();
    var dayOfWeek = today.getDay();
    var message = document.getElementById('message');

    // Simulate uncertainty for non-premium users
    var isFridayForSure = Math.random() < 0.5; // 50% chance to be sure it's Friday

    if (dayOfWeek === 5 && isFridayForSure) {
        message.textContent = "Yes, it's definitely Friday!";
    } else if (dayOfWeek === 5) {
        message.textContent = "It might be Friday... Subscribe to Premium to be sure!";
    } else {
        message.textContent = "No, it's not Friday.";
    }
});

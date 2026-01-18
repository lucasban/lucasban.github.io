document.addEventListener('DOMContentLoaded', function() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const message = document.getElementById('message');

    // Simulate uncertainty for non-premium users
    const isFridayForSure = (dayOfWeek === 5) || (Math.random() < 0.5);

    if (dayOfWeek === 5 && isFridayForSure) {
        message.textContent = "Yes, it's Friday (but confirm with Agatha).";
    } else if (dayOfWeek === 5) {
        message.textContent = "It might be Friday... Subscribe to Premium (or ask Agatha) to be sure!";
    } else {
        message.textContent = "No, it's not Friday.";
    }
});

// script.js
document.getElementById('checkButton').addEventListener('click', () => {
    const today = new Date();
    const isThursday = today.getDay() === 4; // In JavaScript, Sunday is 0, Thursday is 4
    const resultDiv = document.getElementById('result');
    resultDiv.classList.remove('hidden');

    if (isThursday) {
        resultDiv.innerHTML = "Yes, it's Thursday! Friday's almost here! 🥳";
    } else {
        const daysUntilThursday = (4 - today.getDay() + 7) % 7;
        resultDiv.innerHTML = daysUntilThursday === 0 ? "It's not Thursday, but that means it's Friday! 🎉" : `Nope, but only ${daysUntilThursday} day(s) until Thursday!`;
    }
});

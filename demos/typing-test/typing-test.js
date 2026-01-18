// Typing Speed Test
(function() {
    const textDisplay = document.getElementById('text-display');
    const typingInput = document.getElementById('typing-input');
    const wpmDisplay = document.getElementById('wpm');
    const accuracyDisplay = document.getElementById('accuracy');
    const timeDisplay = document.getElementById('time');
    const messageEl = document.getElementById('message');
    const restartBtn = document.getElementById('restart-btn');
    const difficultySelect = document.getElementById('difficulty-select');
    const pbValueDisplay = document.getElementById('pb-value');

    // Word lists by difficulty
    const wordLists = {
        easy: [
            'the', 'be', 'to', 'of', 'and', 'a', 'in', 'it', 'for', 'not',
            'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his',
            'by', 'we', 'say', 'her', 'she', 'or', 'an', 'my', 'one', 'all',
            'so', 'up', 'out', 'if', 'who', 'get', 'go', 'me', 'can', 'like',
            'no', 'just', 'him', 'see', 'now', 'way', 'may', 'day', 'too', 'any',
            'new', 'use', 'how', 'our', 'two', 'more', 'very', 'been', 'call', 'am',
            'its', 'who', 'oil', 'sit', 'now', 'find', 'long', 'down', 'day', 'did',
            'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see'
        ],
        normal: [
            'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I',
            'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
            'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
            'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
            'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
            'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
            'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
            'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
            'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
            'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us'
        ],
        hard: [
            'algorithm', 'synchronize', 'bibliography', 'catastrophe', 'development',
            'environment', 'fundamental', 'hypothesis', 'immediately', 'javascript',
            'knowledge', 'laboratory', 'magnificent', 'neighborhood', 'opportunity',
            'particularly', 'questionnaire', 'responsibility', 'sophisticated', 'temperature',
            'understanding', 'vulnerability', 'extraordinary', 'communication', 'professional',
            'international', 'configuration', 'authentication', 'comprehensive', 'infrastructure',
            'implementation', 'administration', 'characteristics', 'representation', 'determination',
            'accomplishment', 'acknowledgment', 'approximately', 'circumstances', 'concentration',
            'consciousness', 'contradiction', 'demonstration', 'disappointment', 'discrimination',
            'embarrassment', 'encouragement', 'entertainment', 'establishment', 'experimentation'
        ]
    };

    const timeLimits = {
        easy: 45,
        normal: 60,
        hard: 60
    };

    const PB_STORAGE_KEY = 'typing-test-pb';

    let words = [];
    let currentWordIndex = 0;
    let correctWords = 0;
    let incorrectWords = 0;
    let startTime = null;
    let timerInterval = null;
    let timeLimit = 60;
    let isRunning = false;
    let isComplete = false;
    let currentDifficulty = 'normal';

    // Load personal bests
    function loadPersonalBests() {
        try {
            const saved = localStorage.getItem(PB_STORAGE_KEY);
            return saved ? JSON.parse(saved) : { easy: null, normal: null, hard: null };
        } catch (e) {
            return { easy: null, normal: null, hard: null };
        }
    }

    function savePersonalBest(difficulty, wpm) {
        const pbs = loadPersonalBests();
        pbs[difficulty] = wpm;
        try {
            localStorage.setItem(PB_STORAGE_KEY, JSON.stringify(pbs));
        } catch (e) {
            // localStorage unavailable
        }
    }

    function updatePBDisplay() {
        const pbs = loadPersonalBests();
        const currentPB = pbs[currentDifficulty];
        if (currentPB !== null) {
            pbValueDisplay.textContent = currentPB;
            pbValueDisplay.classList.remove('new-record');
        } else {
            pbValueDisplay.textContent = '--';
        }
    }

    function generateWords(count = 50) {
        const wordList = wordLists[currentDifficulty];
        const result = [];
        for (let i = 0; i < count; i++) {
            result.push(wordList[Math.floor(Math.random() * wordList.length)]);
        }
        return result;
    }

    function renderWords() {
        textDisplay.innerHTML = words.map((word, index) => {
            let className = 'word';
            if (index === currentWordIndex) className += ' current';
            if (index < currentWordIndex) {
                // Already typed
                className += words[index].correct ? ' correct' : ' incorrect';
            }
            return `<span class="${className}">${word}</span>`;
        }).join(' ');
    }

    function startTest() {
        if (isRunning || isComplete) return;

        isRunning = true;
        startTime = Date.now();
        messageEl.style.display = 'none';

        timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const remaining = Math.max(0, timeLimit - elapsed);
            timeDisplay.textContent = remaining;

            if (remaining <= 0) {
                endTest();
            }
        }, 100);
    }

    function endTest() {
        isRunning = false;
        isComplete = true;
        clearInterval(timerInterval);
        typingInput.disabled = true;

        const finalWPM = parseInt(wpmDisplay.textContent);
        const finalAccuracy = accuracyDisplay.textContent;

        // Check for personal best
        const pbs = loadPersonalBests();
        const currentPB = pbs[currentDifficulty];
        const isNewPB = currentPB === null || finalWPM > currentPB;

        if (isNewPB && finalWPM > 0) {
            savePersonalBest(currentDifficulty, finalWPM);
            messageEl.textContent = `New Personal Best! ${finalWPM} WPM with ${finalAccuracy} accuracy`;
            messageEl.className = 'message new-pb';
            pbValueDisplay.textContent = finalWPM;
            pbValueDisplay.classList.add('new-record');
        } else {
            messageEl.textContent = `Complete! ${finalWPM} WPM with ${finalAccuracy} accuracy`;
            messageEl.className = 'message complete';
        }
        messageEl.style.display = 'block';
    }

    function updateStats() {
        const totalTyped = correctWords + incorrectWords;

        // Calculate WPM
        if (startTime && isRunning) {
            const elapsedMinutes = (Date.now() - startTime) / 60000;
            const wpm = Math.round(correctWords / elapsedMinutes) || 0;
            wpmDisplay.textContent = wpm;
        }

        // Calculate accuracy
        if (totalTyped > 0) {
            const accuracy = Math.round((correctWords / totalTyped) * 100);
            accuracyDisplay.textContent = accuracy + '%';
        }
    }

    function handleInput() {
        const inputValue = typingInput.value.trim();

        // Start timer on first input
        if (!isRunning && !isComplete && inputValue.length > 0) {
            startTest();
        }

        // Check if space was pressed (word complete)
        if (typingInput.value.endsWith(' ')) {
            const typedWord = inputValue;
            const currentWord = words[currentWordIndex];

            if (typedWord === currentWord) {
                words[currentWordIndex] = { toString: () => currentWord, correct: true };
                correctWords++;
            } else {
                words[currentWordIndex] = { toString: () => currentWord, correct: false };
                incorrectWords++;
            }

            currentWordIndex++;
            typingInput.value = '';

            // Add more words if needed
            if (currentWordIndex >= words.length - 10) {
                words = words.concat(generateWords(20));
            }

            renderWords();
            updateStats();
        }
    }

    function resetTest() {
        clearInterval(timerInterval);
        isRunning = false;
        isComplete = false;
        startTime = null;
        currentWordIndex = 0;
        correctWords = 0;
        incorrectWords = 0;

        // Update difficulty and time limit
        currentDifficulty = difficultySelect.value;
        timeLimit = timeLimits[currentDifficulty];

        words = generateWords(50);
        renderWords();

        typingInput.value = '';
        typingInput.disabled = false;
        typingInput.focus();

        wpmDisplay.textContent = '0';
        accuracyDisplay.textContent = '100%';
        timeDisplay.textContent = timeLimit;

        messageEl.textContent = 'Click the text box and start typing to begin';
        messageEl.className = 'message ready';
        messageEl.style.display = 'block';

        updatePBDisplay();
    }

    // Event listeners
    typingInput.addEventListener('input', handleInput);
    restartBtn.addEventListener('click', resetTest);
    difficultySelect.addEventListener('change', () => {
        if (!isRunning) {
            resetTest();
        }
    });

    // Initialize
    resetTest();
})();

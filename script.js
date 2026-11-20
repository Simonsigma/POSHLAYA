// script.js
document.addEventListener('DOMContentLoaded', () => {
    // Состояние игры
    let currentScreen = 'menu';
    let dialogueIndex = 0;
    let isTyping = false;
    let typingTimeout;
    let isMusicPlaying = false;

    // Элементы DOM
    const screens = {
        menu: document.getElementById('screen-menu'),
        select: document.getElementById('screen-select'),
        game: document.getElementById('screen-game'),
        finale: document.getElementById('screen-finale')
    };

    const btnStart = document.getElementById('btn-start');
    const btnMusic = document.getElementById('btn-music');
    const musicIcon = document.getElementById('music-icon');
    const charTesla = document.getElementById('char-tesla');
    const charLocked1 = document.getElementById('char-locked1');
    const charLocked2 = document.getElementById('char-locked2');
    const notification = document.getElementById('notification');
    const dialogueBox = document.getElementById('dialogue-box');
    const dialogueText = document.getElementById('dialogue-text');
    const btnNext = document.getElementById('btn-next');
    const dramaticText = document.getElementById('dramatic-text');
    const playerLine = document.getElementById('player-line');
    const fadeBlack = document.getElementById('fade-black');
    const gameBg = document.getElementById('game-bg');
    const finaleBg = document.getElementById('finale-bg');

    // Звуковые эффекты через Web Audio
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const audioCtx = AudioContextClass ? new AudioContextClass() : null;

    function playSound(type) {
        if (!audioCtx) return;

        try {
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }

            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            osc.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            if (type === 'click') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, audioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.1);
            } else if (type === 'finale') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(100, audioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 1);
                gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1);
                osc.start();
                osc.stop(audioCtx.currentTime + 1);
            }
        } catch (e) {
            console.log('Audio not supported or error:', e);
        }
    }

    // Настоящая фоновая музыка из assets/music.mp3
    const bgMusic = new Audio('assets/music.mp3');
    bgMusic.loop = true;
    bgMusic.preload = 'auto';
    bgMusic.volume = 0.35;

    async function toggleMusic() {
        if (isMusicPlaying) {
            bgMusic.pause();
            musicIcon.innerText = '🔇';
            isMusicPlaying = false;
        } else {
            try {
                if (audioCtx && audioCtx.state === 'suspended') {
                    await audioCtx.resume();
                }

                await bgMusic.play();
                musicIcon.innerText = '🎵';
                isMusicPlaying = true;
            } catch (error) {
                isMusicPlaying = false;
                musicIcon.innerText = '🔇';
                console.error('Не удалось запустить музыку. Проверь assets/music.mp3:', error);
                showNotification('Не удалось загрузить музыку');
            }
        }
    }

    // Кнопка включения / выключения музыки
    btnMusic.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMusic();
        playSound('click');
    });

    // Переключение экранов
    function showScreen(screenName) {
        Object.values(screens).forEach(s => s.classList.remove('active'));
        screens[screenName].classList.add('active');
        currentScreen = screenName;
    }

    // --- Сцена 1: Меню ---
    btnStart.addEventListener('click', () => {
        playSound('click');
        if (!isMusicPlaying) {
            toggleMusic();
        }
        showScreen('select');
    });

    // --- Сцена 2: Выбор персонажа ---
    function showNotification(text) {
        notification.innerText = text;
        notification.classList.add('show');
        setTimeout(() => notification.classList.remove('show'), 1500);
    }

    charLocked1.addEventListener('click', () => {
        playSound('click');
        showNotification('Недоступно');
    });

    charLocked2.addEventListener('click', () => {
        playSound('click');
        showNotification('Недоступно');
    });

    charTesla.addEventListener('click', () => {
        playSound('click');
        if (!charTesla.classList.contains('selected')) {
            charTesla.classList.add('selected');
            setTimeout(() => {
                showScreen('game');
                startDialogue();
            }, 800);
        }
    });

    // --- Сцена 3: Диалог ---
    const dialogueData = [
        { speaker: 'Тесла', text: 'Привет, я немного выпила…' },
        { speaker: 'Тесла', text: 'Мне надо кое-что тебе сказать…' },
        { speaker: 'Тесла', text: 'Я…' },
        { speaker: 'Тесла', text: 'Я тебя хочу, просто пи3Dц как…' }
    ];

    function startDialogue() {
        dialogueIndex = 0;
        loadDialogue();
    }

    function loadDialogue() {
        if (dialogueIndex >= dialogueData.length) {
            startFinale();
            return;
        }

        const data = dialogueData[dialogueIndex];
        document.getElementById('speaker-name').innerText = data.speaker;

        // Сброс текста и запуск печати
        dialogueText.innerText = '';
        typeText(data.text);
    }

    function typeText(text) {
        isTyping = true;
        let i = 0;
        dialogueText.innerText = '';
        btnNext.style.opacity = '0.5';

        function type() {
            if (i < text.length) {
                dialogueText.innerText += text.charAt(i);
                i++;
                typingTimeout = setTimeout(type, 40);
            } else {
                isTyping = false;
                btnNext.style.opacity = '1';
            }
        }

        type();
    }

    btnNext.addEventListener('click', () => {
        playSound('click');
        if (isTyping) {
            // Мгновенно завершить печать
            clearTimeout(typingTimeout);
            dialogueText.innerText = dialogueData[dialogueIndex].text;
            isTyping = false;
            btnNext.style.opacity = '1';
        } else {
            // Следующая реплика
            dialogueIndex++;
            loadDialogue();
        }
    });

    // --- Сцена 4: Финал ---
    function startFinale() {
        dialogueBox.style.display = 'none';
        showScreen('finale');
        playSound('finale');

        // Настройка фона
        finaleBg.style.opacity = '0.8';

        setTimeout(() => {
            dramaticText.classList.remove('hidden');
            void dramaticText.offsetWidth;
            dramaticText.classList.add('show');

            setTimeout(() => {
                playerLine.classList.remove('hidden');
                void playerLine.offsetWidth;
                playerLine.classList.add('show');

                setTimeout(() => {
                    fadeBlack.classList.add('active');

                    setTimeout(() => {
                        // Рестарт
                        fadeBlack.classList.remove('active');
                        resetGame();
                    }, 2500);

                }, 3000);
            }, 3500);
        }, 500);
    }

    // --- Сброс игры ---
    function resetGame() {
        dialogueIndex = 0;
        isTyping = false;
        clearTimeout(typingTimeout);

        // Музыка продолжает играть при возвращении в меню
        dialogueText.innerText = '';
        dialogueBox.style.display = 'flex';
        dramaticText.classList.remove('show');
        dramaticText.classList.add('hidden');
        playerLine.classList.remove('show');
        playerLine.classList.add('hidden');
        charTesla.classList.remove('selected');

        showScreen('menu');
    }

    // Защита от контекстного меню
    document.addEventListener('contextmenu', event => event.preventDefault());
});

document.addEventListener('DOMContentLoaded', function () {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const compressor = audioContext.createDynamicsCompressor();
    compressor.connect(audioContext.destination);

    // Reverb setup
    const convolver = audioContext.createConvolver();
    convolver.connect(compressor);

    // Delay setup
    const delay = audioContext.createDelay();
    delay.delayTime.value = 0.3; // Default delay time
    delay.connect(compressor);

    // Frequency filter setup
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass'; // Default to lowpass filter
    filter.frequency.value = 1000;
    filter.connect(compressor);

    const chords = [
        'audio/chord1.mp3',
        'audio/chord2.mp3',
        'audio/chord3.mp3',
        'audio/chord4.mp3',
        'audio/chord5.mp3',
        'audio/chord6.mp3',
        'audio/chord7.mp3',
        'audio/chord8.mp3'
    ];

    let audioBuffers = [];
    const canvas = document.getElementById('visualizer');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const circles = []; // Store active circles

    // Load all audio files into buffers
    async function loadAudioFiles() {
        const fetchPromises = chords.map(url => fetch(url).then(res => res.arrayBuffer()));
        const audioData = await Promise.all(fetchPromises);
        for (const data of audioData) {
            const buffer = await audioContext.decodeAudioData(data);
            audioBuffers.push(buffer);
        }
    }

    function playBuffer(buffer) {
        const source = audioContext.createBufferSource();
        source.buffer = buffer;

        // Randomly reverse the playback
        if (Math.random() > 0.5) {
            source.playbackRate.value = -1;
        }

        // Randomly select and connect FX
        const fxChoice = Math.random();
        if (fxChoice < 0.33) {
            source.connect(filter); // Apply filter
        } else if (fxChoice < 0.66) {
            source.connect(delay); // Apply delay
        } else {
            source.connect(convolver); // Apply reverb
        }

        source.start();
        createCircle(); // Trigger a new circle with each chord
    }

    function playRandomChord() {
        const randomIndex = Math.floor(Math.random() * audioBuffers.length);
        playBuffer(audioBuffers[randomIndex]);

        const randomInterval = Math.random() * (5000 - 1000) + 1000; // Random time between chords
        setTimeout(playRandomChord, randomInterval);
    }

    function startMusic() {
        loadAudioFiles().then(() => {
            audioContext.resume();
            playRandomChord();
            animateVisualizer();
            evolveFX(); // Continuously evolve FX parameters
        });
    }

    function createCircle() {
        const size = Math.random() * 12.5 + 5; // Reduced size (5 to 17.5)
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const opacity = Math.random() * 0.5 + 0.5; // Random opacity (0.5 to 1)
        const circle = {
            x,
            y,
            size,
            opacity,
            growth: Math.random() * 1 + 0.5, // Growth speed (0.5 to 1.5)
            alpha: 1, // Fully visible
            fadeSpeed: 1 / (60 * 8) // Fade out over 8 seconds
        };
        circles.push(circle);
    }

    function animateVisualizer() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = circles.length - 1; i >= 0; i--) {
            const circle = circles[i];

            // Draw the circle
            ctx.beginPath();
            ctx.arc(circle.x, circle.y, circle.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${circle.alpha * circle.opacity})`;
            ctx.fill();

            // Update circle properties
            circle.size += circle.growth; // Grow the circle
            circle.alpha -= circle.fadeSpeed; // Fade out

            // Remove the circle if it is completely faded
            if (circle.alpha <= 0) {
                circles.splice(i, 1);
            }
        }

        requestAnimationFrame(animateVisualizer);
    }

    function evolveFX() {
        // Subtly change FX parameters over time
        setInterval(() => {
            filter.frequency.value = Math.random() * 2000 + 500; // Random frequency (500 to 2500 Hz)
            delay.delayTime.value = Math.random() * 0.5 + 0.1; // Random delay time (0.1 to 0.6s)
        }, 10000); // Every 10 seconds
    }

    // Automatically start the music experience
    startMusic();

    // Handle window resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
});

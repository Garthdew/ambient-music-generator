document.addEventListener('DOMContentLoaded', function () {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const compressor = audioContext.createDynamicsCompressor();
    compressor.connect(audioContext.destination);

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
    let playing = false;

    const canvas = document.getElementById('visualizer');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const circles = []; // Store active circles

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
        source.connect(compressor);
        source.start();
        createCircle(); // Trigger a new circle with each chord
    }

    function playRandomChord() {
        if (!playing) return;
        const randomIndex = Math.floor(Math.random() * audioBuffers.length);
        playBuffer(audioBuffers[randomIndex]);
        const randomInterval = Math.random() * (5000 - 1000) + 1000; // Random time between chords
        setTimeout(playRandomChord, randomInterval);
    }

    function startMusic() {
        if (!playing) {
            if (audioBuffers.length === 0) loadAudioFiles();
            playing = true;
            playRandomChord();
            animateVisualizer();
        }
    }

    function stopMusic() {
        playing = false;
    }

    document.getElementById('playButton').addEventListener('click', function () {
        if (playing) {
            stopMusic();
            this.textContent = 'Generate';
        } else {
            if (audioContext.state === 'suspended') {
                audioContext.resume().then(startMusic);
            } else {
                startMusic();
            }
            this.textContent = 'Stop';
        }
    });

    function createCircle() {
        const size = Math.random() * 50 + 20; // Random size between 20 and 70
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const opacity = Math.random() * 0.5 + 0.5; // Random opacity between 0.5 and 1
        const circle = {
            x,
            y,
            size,
            opacity,
            growth: Math.random() * 2 + 1, // Growth speed
            alpha: 1, // Start fully visible
            fadeSpeed: 0.01 // Fade out speed
        };
        circles.push(circle);
    }

    function animateVisualizer() {
        if (!playing) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw and update each circle
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

    // Handle window resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
});

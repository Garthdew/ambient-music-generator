document.addEventListener('DOMContentLoaded', function () {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const compressor = audioContext.createDynamicsCompressor();
    compressor.connect(audioContext.destination);
    analyser.connect(compressor);

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
        source.connect(analyser);
        source.start();
    }

    function playRandomChord() {
        if (!playing) return;
        const randomIndex = Math.floor(Math.random() * audioBuffers.length);
        playBuffer(audioBuffers[randomIndex]);
        const randomInterval = Math.random() * (5000 - 1000) + 1000;
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

    function drawCircle(x, y, radius, alpha) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
    }

    function animateVisualizer() {
        if (!playing) return;
        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < dataArray.length; i++) {
            const value = dataArray[i];
            const radius = (value / 255) * 50; // Scale radius by audio intensity
            const alpha = value / 255; // Scale transparency by intensity
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;

            drawCircle(x, y, radius, alpha);
        }

        requestAnimationFrame(animateVisualizer);
    }

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
});

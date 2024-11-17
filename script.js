
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
    }

    function playRandomChord() {
        if (!playing) return;
        const randomIndex = Math.floor(Math.random() * audioBuffers.length);
        playBuffer(audioBuffers[randomIndex]);
        const randomInterval = Math.random() * (5000 - 1000) + 1000;
        setTimeout(playRandomChord, randomInterval);
    }

    async function startMusic() {
        if (!playing) {
            if (audioBuffers.length === 0) await loadAudioFiles();
            playing = true;
            playRandomChord();
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
});

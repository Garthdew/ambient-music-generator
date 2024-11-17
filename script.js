document.addEventListener('DOMContentLoaded', function () {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
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
    let playing = false;

    function playRandomChord() {
        if (!playing) return;
        const randomIndex = Math.floor(Math.random() * chords.length);
        const audio = new Audio(chords[randomIndex]);
        audio.play();
        setTimeout(playRandomChord, Math.random() * 4000 + 1000); // Play a sound every 1-5 seconds
    }

    document.getElementById('playButton').addEventListener('click', function () {
        playing = !playing;
        this.textContent = playing ? 'Stop' : 'Generate';
        if (playing) playRandomChord();
    });
});

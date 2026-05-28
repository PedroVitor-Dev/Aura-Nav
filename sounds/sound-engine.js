(function () {
  if (window.__auraSound) return;

  let currentAudio = null;
  let currentSrc = null;
  let fadeDuration = 1500;
  let volume = 0.3;

  // Faz fade out e destroi o audio atual
  function fadeOut(audio, callback) {
    if (!audio) { callback?.(); return; }

    const step = audio.volume / (fadeDuration / 50);

    const interval = setInterval(() => {
      if (audio.volume > step) {
        audio.volume = Math.max(0, audio.volume - step);
      } else {
        clearInterval(interval);
        audio.pause();
        audio.src = "";
        callback?.();
      }
    }, 50);
  }

  // Faz fade in no audio
  function fadeIn(audio) {
    audio.volume = 0;
    audio.play().catch(() => {});

    const step = volume / (fadeDuration / 50);

    const interval = setInterval(() => {
      if (audio.volume + step < volume) {
        audio.volume = Math.min(volume, audio.volume + step);
      } else {
        audio.volume = volume;
        clearInterval(interval);
      }
    }, 50);
  }

  // Toca um som com fade
  function play(src) {
    if (currentSrc === src) return;

    fadeOut(currentAudio, () => {
      const audio = new Audio(src);
      audio.loop = true;

      currentAudio = audio;
      currentSrc = src;

      fadeIn(audio);
    });
  }

  // Para tudo
  function stop() {
    fadeOut(currentAudio, () => {
      currentAudio = null;
      currentSrc = null;
    });
  }

  // Ajusta volume
  function setVolume(v) {
    volume = Math.min(1, Math.max(0, v));
    if (currentAudio) currentAudio.volume = volume;
  }

  window.__auraSound = { play, stop, setVolume };
})();
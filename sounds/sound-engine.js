(function () {
  if (window.__auraSound) return;

  let currentAudio = null;
  let currentSrc = null;
  let pendingSrc = null;
  let fadeDuration = 1500;
  let volume = 0.3;
  let userInteracted = false;

  // Detecta primeira interação do usuário
  function onFirstInteraction() {
    userInteracted = true;
    window.removeEventListener("click", onFirstInteraction);
    window.removeEventListener("keydown", onFirstInteraction);

    // Se tinha um som pendente, toca agora
    if (pendingSrc) {
      const src = pendingSrc;
      pendingSrc = null;
      play(src);
    }
  }

  window.addEventListener("click", onFirstInteraction);
  window.addEventListener("keydown", onFirstInteraction);

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

  function play(src) {
    if (currentSrc === src) return;

    // Aguarda interação do usuário
    if (!userInteracted) {
      pendingSrc = src;
      return;
    }

    fadeOut(currentAudio, () => {
      const audio = new Audio(src);
      audio.loop = true;
      currentAudio = audio;
      currentSrc = src;
      fadeIn(audio);
    });
  }

  function stop() {
    pendingSrc = null;
    fadeOut(currentAudio, () => {
      currentAudio = null;
      currentSrc = null;
    });
  }

  function setVolume(v) {
    volume = Math.min(1, Math.max(0, v));
    if (currentAudio) currentAudio.volume = volume;
  }

  window.__auraSound = { play, stop, setVolume };
})();
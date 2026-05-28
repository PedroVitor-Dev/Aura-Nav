const MOODS = {
  morning: {
    name: "morning",
    label: "Manhã Limpa",
    colors: ["#fceabb", "#f8b500"],
    particles: "dust",
    sound: null,
  },
 energetic: {
  name: "energetic",
  label: "Tarde Energética",
  colors: ["#f7971e", "#ffd200"],
  particles: "sparks",
  sound: "relax_lofi", // atualizado
},
  chill: {
    name: "chill",
    label: "Noite Chill",
    colors: ["#4facfe", "#00f2fe"],
    particles: "stars",
    sound: "rain",
  },
  cyber: {
    name: "cyber",
    label: "Madrugada Cyber",
    colors: ["#00ffff", "#000814"],
    particles: "rain",
    sound: "keyboard",
  },
  focus: {
    name: "focus",
    label: "Modo Foco",
    colors: ["#e0e0e0", "#ffffff"],
    particles: "none",
    sound: "cafe",
  },
  dev: {
    name: "dev",
    label: "Modo Dev",
    colors: ["#00ffcc", "#0d0d0d"],
    particles: "rain",
    sound: "keyboard",
  },
  neon: {
    name: "neon",
    label: "Neon Vibes",
    colors: ["#ff00ff", "#1a001a"],
    particles: "sparks",
    sound: null,
  },
  cozy: {
    name: "cozy",
    label: "Cozy Mode",
    colors: ["#f6d365", "#fda085"],
    particles: "dust",
    sound: "cafe",
  },
};

function getMoodByTime() {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return MOODS.morning;
  if (hour >= 12 && hour < 18) return MOODS.energetic;
  if (hour >= 18 && hour < 23) return MOODS.chill;
  return MOODS.cyber;
}

function getMoodBySite(hostname) {
  const siteMap = {
    "github.com":        MOODS.dev,
    "gitlab.com":        MOODS.dev,
    "youtube.com":       MOODS.neon,
    "music.youtube.com": MOODS.neon,
    "open.spotify.com":  MOODS.chill,
    "reddit.com":        MOODS.cozy,
    "docs.google.com":   MOODS.focus,
    "notion.so":         MOODS.focus,
    "linear.app":        MOODS.focus,
  };

  for (const site in siteMap) {
    if (hostname.includes(site)) return siteMap[site];
  }

  return null;
}

function resolveMood(hostname) {
  const siteMood = getMoodBySite(hostname);
  if (siteMood) return siteMood;
  return getMoodByTime();
}
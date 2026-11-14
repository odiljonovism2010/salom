import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { supabase } from "./firebase"; // Supabase klienti

const MONTHS = [
  "YANVAR", "FEVRAL", "MART", "APREL", "MAY", "IYUN",
  "IYUL", "AVGUST", "SENTABR", "OKTABR", "NOYABR", "DEKABR",
];

const WEEKDAYS = [
  "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba", "Yakshanba",
];

const SAMPLE_TRACKS = [
  { id: 1, title: "Kuy 1", url: "/music/11.mp3" },
  { id: 2, title: "Kuy 2", url: "/music/12.mp3" },
  { id: 3, title: "Kuy 3", url: "/music/13.mp3" },
  { id: 4, title: "Kuy 4", url: "/music/14.mp3" },
];

const BACKGROUND_SAMPLES = [
  "https://images.uzum.uz/d8l97oc9g1ktqmltd9n0/original.jpg",
  "https://images.uzum.uz/d8jvajbsv8vo2t0kpbag/t_product_540_high.jpg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRa-AK9rS2rbLai_ZxVquvv0W1uz1CpBdi3G-w0Nr3jxg&s=10",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTMfx_x1vb7sPIAFxcVYurSJNvfjIDFG2MrByGZHX2Nw2PLt-e0WU9NS2p&s=10",
];

const CENTER_SAMPLES = [
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTWBMuDPyw7NC4fdlaqVk7abfHa_lVSipdmaRbwOVxJewqRHMvEj26KEdg&s=10",
  "https://png.pngtree.com/thumb_back/fw800/background/20230314/pngtree-wedding-ring-engagement-background-image_1947930.jpg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYDstFkj0Wro56qOzGPrPicvoxdekpJMoOCLhIng2fEg&s=10",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQV78bdKzGbqK0_GjIvMn4vgysyLwsCSa_7QiN8VuPHGg&s=10",
];

// Падающие украшения: SVG вместо эмодзи, чтобы на любом телефоне выглядели одинаково
const HEART_PATH =
  "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z";

const RAIN_SHAPES = [
  `<svg viewBox="0 0 24 24"><path fill="#ff6f9f" d="${HEART_PATH}"/></svg>`,
  `<svg viewBox="0 0 24 24"><path fill="#ffffff" d="${HEART_PATH}"/></svg>`,
  `<svg viewBox="0 0 24 24"><path fill="#f2dca3" d="M12 1.5l2.6 8 8 2.5-8 2.5-2.6 8-2.6-8-8-2.5 8-2.5z"/></svg>`,
  `<svg viewBox="0 0 24 24"><g fill="#ffb3cc"><ellipse cx="12" cy="6.2" rx="3.3" ry="4.7"/><ellipse cx="12" cy="6.2" rx="3.3" ry="4.7" transform="rotate(72 12 12)"/><ellipse cx="12" cy="6.2" rx="3.3" ry="4.7" transform="rotate(144 12 12)"/><ellipse cx="12" cy="6.2" rx="3.3" ry="4.7" transform="rotate(216 12 12)"/><ellipse cx="12" cy="6.2" rx="3.3" ry="4.7" transform="rotate(288 12 12)"/></g><circle cx="12" cy="12" r="2.4" fill="#f2dca3"/></svg>`,
  `<svg viewBox="0 0 24 24" fill="none" stroke="#f2dca3" stroke-width="2"><circle cx="8.5" cy="14.5" r="5.5"/><circle cx="15.5" cy="14.5" r="5.5"/><path d="M6.8 4.2l1.7 2.3 1.7-2.3-.8-1.6H7.6z" fill="#f2dca3" stroke="none"/></svg>`,
  `<svg viewBox="0 0 24 24"><path fill="#ffd0df" d="M12 2c4.5 3.2 6.5 7.4 6.5 11.2A6.5 6.5 0 0 1 12 20a6.5 6.5 0 0 1-6.5-6.8C5.5 9.4 7.5 5.2 12 2z"/></svg>`,
];

// Yulduzchalar uchun doimiy (random emas) pozitsiyalar
const SPARKLES = Array.from({ length: 28 }, (_, i) => ({
  left: `${(i * 37 + 11) % 100}%`,
  top: `${(i * 53 + 7) % 100}%`,
  delay: `${(i % 9) * 0.55}s`,
  duration: `${3 + (i % 5)}s`,
}));

// Tushib turuvchi oltin chang zarralari (doimiy joylashuv)
const DUST = Array.from({ length: 22 }, (_, i) => ({
  left: `${(i * 47 + 9) % 100}%`,
  size: 2 + (i % 4),
  delay: `-${(i % 11) * 1.3}s`,
  duration: `${14 + (i % 7) * 2.5}s`,
  sway: `${((i % 5) - 2) * 26}px`,
}));

const PinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.6" />
  </svg>
);

// =========================
// MA'LUMOTLAR HAVOLANING O'ZIDA
// Supabase javob bermasa ham taklifnoma boshqalarga to'liq ochiladi
// =========================
const SHARE_FIELDS = [
  "topText", "title", "subtitle", "description", "firstName", "secondName",
  "day", "month", "year", "time", "weekday", "restaurant", "address", "bottomText",
];

// Faqat https://... yoki /... ko'rinishidagi havolalar (blob: va boshqalar o'tmaydi)
const safeUrl = (u) =>
  typeof u === "string" && /^(https?:\/\/|\/(?!\/))[^\s"'()<>\\]*$/.test(u) ? u : "";

const toBase64Url = (obj) => {
  const bytes = new TextEncoder().encode(JSON.stringify(obj));
  let bin = "";
  bytes.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const decodeShared = (raw) => {
  if (!raw) return null;
  try {
    const b64 = raw.replace(/-/g, "+").replace(/_/g, "/");
    const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
    const o = JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0))));
    if (!o || typeof o !== "object" || !o.data || typeof o.data !== "object") return null;

    const data = {};
    SHARE_FIELDS.forEach((k) => {
      data[k] = String(o.data[k] ?? "").slice(0, 2000);
    });
    return { data, bgImg: safeUrl(o.bgImg), cImg: safeUrl(o.cImg), musicUrl: safeUrl(o.musicUrl) };
  } catch {
    return null;
  }
};

const initialOf = (s) => (s || "").trim().charAt(0).toUpperCase();

// Har bir harfi alohida animatsiya qilinadigan matn
function SplitText({ text }) {
  return (
    <span className="split" aria-label={text}>
      {Array.from(text || "").map((ch, i) => (
        <span key={i} aria-hidden="true" style={{ "--i": i }}>
          {ch === " " ? " " : ch}
        </span>
      ))}
    </span>
  );
}

const MusicNoteIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

const UploadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 16V4" />
    <path d="m7 9 5-5 5 5" />
    <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
  </svg>
);

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <polygon points="6 3 20 12 6 21 6 3" />
  </svg>
);

const MuteIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 5 6 9H2v6h4l5 4V5z" />
    <path d="m22 9-6 6" />
    <path d="m16 9 6 6" />
  </svg>
);

const PauseIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="4" width="4.5" height="16" rx="1.4" />
    <rect x="13.5" y="4" width="4.5" height="16" rx="1.4" />
  </svg>
);

const PrevIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 5v14L8 12z" />
    <rect x="5" y="5" width="2.6" height="14" rx="1.1" />
  </svg>
);

const NextIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 5v14l10-7z" />
    <rect x="16.4" y="5" width="2.6" height="14" rx="1.1" />
  </svg>
);

const COVER_COLORS = [
  ["#f2dca3", "#a8843a"],
  ["#f4b8cc", "#8f4a6e"],
  ["#b5c9f7", "#4c5fa3"],
  ["#bfe6d6", "#3f7d69"],
];
const CUSTOM_COVER = ["#d9c8ff", "#6b4fd1"];

const formatTime = (s) => {
  if (!Number.isFinite(s) || s < 0) return "0:00";
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
};

// =========================
// ZAMONAVIY MUSIQA PLEYERI
// =========================
function MusicPlayer({
  audioRef,
  isPlaying,
  tracks,
  type,
  musicUrl,
  musicFile,
  customUrl,
  onPickTrack,
  onPickCustom,
  onFile,
  onToggle,
  onStep,
}) {
  const [time, setTime] = useState({ cur: 0, dur: 0 });
  const barRef = useRef(null);
  const dragging = useRef(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const sync = () => setTime({ cur: audio.currentTime || 0, dur: audio.duration || 0 });
    sync();

    const events = ["timeupdate", "loadedmetadata", "durationchange", "emptied"];
    events.forEach((ev) => audio.addEventListener(ev, sync));
    return () => events.forEach((ev) => audio.removeEventListener(ev, sync));
  }, [audioRef, musicUrl]);

  const seekTo = (clientX) => {
    const audio = audioRef.current;
    const bar = barRef.current;
    if (!audio || !bar || !audio.duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    audio.currentTime = ratio * audio.duration;
  };

  const isCustom = type === "custom";
  const hasCustom = Boolean(customUrl) || isCustom;
  const currentTrack = tracks.find((t) => t.url === musicUrl) || tracks[0];
  const customName = musicFile ? musicFile.name.replace(/\.[^.]+$/, "") : "O‘z musiqangiz";
  const title = isCustom ? customName : currentTrack.title;
  const sub = isCustom ? "Sizning faylingiz" : "Original kuy";
  const pct = time.dur ? Math.min(100, (time.cur / time.dur) * 100) : 0;
  const total = String(tracks.length + 1).padStart(2, "0");

  return (
    <div className="player">
      {/* CHAP: hozir tanlangan musiqa */}
      <div className="player-now">
        <div className={`disc ${isPlaying ? "spin" : ""}`} aria-hidden="true">
          <div className="disc-label">
            <MusicNoteIcon />
          </div>
        </div>

        <div className="now-meta">
          <span className="now-eyebrow">{isPlaying ? "Hozir ijro etilmoqda" : "Tanlangan musiqa"}</span>
          <h3 className="now-title">{title}</h3>
          <p className="now-sub">{sub}</p>
        </div>

        <div className="seek">
          <div
            className="seek-bar"
            ref={barRef}
            role="slider"
            tabIndex={0}
            aria-label="Musiqa vaqti"
            aria-valuemin={0}
            aria-valuemax={Math.round(time.dur)}
            aria-valuenow={Math.round(time.cur)}
            onPointerDown={(e) => {
              dragging.current = true;
              e.currentTarget.setPointerCapture?.(e.pointerId);
              seekTo(e.clientX);
            }}
            onPointerMove={(e) => {
              if (dragging.current) seekTo(e.clientX);
            }}
            onPointerUp={() => {
              dragging.current = false;
            }}
            onPointerCancel={() => {
              dragging.current = false;
            }}
            onKeyDown={(e) => {
              const audio = audioRef.current;
              if (!audio || !audio.duration) return;
              if (e.key === "ArrowRight") {
                audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
                e.preventDefault();
              }
              if (e.key === "ArrowLeft") {
                audio.currentTime = Math.max(0, audio.currentTime - 5);
                e.preventDefault();
              }
            }}
          >
            <div className="seek-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="seek-times">
            <span>{formatTime(time.cur)}</span>
            <span>{formatTime(time.dur)}</span>
          </div>
        </div>

        <div className="controls">
          <button type="button" className="ctrl" onClick={() => onStep(-1)} aria-label="Oldingi kuy">
            <PrevIcon />
          </button>
          <button
            type="button"
            className="ctrl ctrl-main"
            onClick={onToggle}
            aria-label={isPlaying ? "To‘xtatish" : "Ijro etish"}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button type="button" className="ctrl" onClick={() => onStep(1)} aria-label="Keyingi kuy">
            <NextIcon />
          </button>
        </div>
      </div>

      {/* O'NG: kuylar ro'yxati */}
      <div className="player-list">
        <div className="list-head">
          <span>Musiqalar</span>
          <em>{total}</em>
        </div>

        {tracks.map((track, i) => {
          const active = type === "original" && musicUrl === track.url;
          const [c1, c2] = COVER_COLORS[i % COVER_COLORS.length];
          return (
            <div className={`pl-item ${active ? "active" : ""}`} key={track.id}>
              <button
                type="button"
                className="pl-row"
                onClick={() => (active ? onToggle() : onPickTrack(track))}
                aria-label={`${track.title}: ${active && isPlaying ? "to‘xtatish" : "ijro etish"}`}
              >
                <span className="pl-num">
                  {active && isPlaying ? (
                    <span className="mini-eq">
                      <i /><i /><i />
                    </span>
                  ) : (
                    String(i + 1).padStart(2, "0")
                  )}
                </span>
                <span className="pl-cover" style={{ "--c1": c1, "--c2": c2 }}>
                  <MusicNoteIcon />
                </span>
                <span className="pl-meta">
                  <strong>{track.title}</strong>
                  <small>Original kuy</small>
                </span>
                <span className="pl-play">{active && isPlaying ? <PauseIcon /> : <PlayIcon />}</span>
              </button>
            </div>
          );
        })}

        {hasCustom ? (
          <div className={`pl-item has-change ${isCustom ? "active" : ""}`}>
            <button
              type="button"
              className="pl-row"
              onClick={() => (isCustom ? onToggle() : onPickCustom())}
              aria-label={`${customName}: ${isCustom && isPlaying ? "to‘xtatish" : "ijro etish"}`}
            >
              <span className="pl-num">
                {isCustom && isPlaying ? (
                  <span className="mini-eq">
                    <i /><i /><i />
                  </span>
                ) : (
                  total
                )}
              </span>
              <span className="pl-cover" style={{ "--c1": CUSTOM_COVER[0], "--c2": CUSTOM_COVER[1] }}>
                <MusicNoteIcon />
              </span>
              <span className="pl-meta">
                <strong>{customName}</strong>
                <small>Sizning faylingiz</small>
              </span>
              <span className="pl-play">{isCustom && isPlaying ? <PauseIcon /> : <PlayIcon />}</span>
            </button>
            <label className="pl-change" title="Boshqa fayl tanlash" aria-label="Boshqa fayl tanlash">
              <input type="file" accept="audio/*" onChange={onFile} />
              <UploadIcon />
            </label>
          </div>
        ) : (
          <div className="pl-item">
            <label className="pl-row pl-upload">
              <input type="file" accept="audio/*" onChange={onFile} />
              <span className="pl-num">{total}</span>
              <span className="pl-cover">
                <UploadIcon />
              </span>
              <span className="pl-meta">
                <strong>O‘z musiqangiz</strong>
                <small>MP3 faylni yuklash</small>
              </span>
              <span className="pl-play">
                <UploadIcon />
              </span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  const getInitialState = () => {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get("id");
    const shared = decodeShared(params.get("d"));

    const base = {
      step: idParam ? "invitation" : "home",
      data: {
        topText: "",
        title: "",
        subtitle: "",
        description:
          "Hayotimizdagi eng baxtli kunimizni siz bilan birga nishonlashdan mamnun bo‘lamiz.",
        firstName: "",
        secondName: "",
        day: "",
        month: "",
        year: "",
        time: "",
        weekday: "",
        restaurant: "",
        address: "",
        bottomText: "",
      },
      bgImg: "",
      cImg: "",
      musicUrl: "/music/11.mp3",
    };

    if (!shared) return base;

    return {
      ...base,
      step: "invitation",
      data: { ...base.data, ...shared.data },
      bgImg: shared.bgImg,
      cImg: shared.cImg,
      musicUrl: shared.musicUrl || base.musicUrl,
    };
  };

  const initialState = getInitialState();

  const [step, setStep] = useState(initialState.step);
  const [data, setData] = useState(initialState.data);
  const [backgroundImage, setBackgroundImage] = useState(initialState.bgImg);
  const [centerImage, setCenterImage] = useState(initialState.cImg);
  const [musicUrl, setMusicUrl] = useState(initialState.musicUrl);

  const [bgFile, setBgFile] = useState(null);
  const [centerFile, setCenterFile] = useState(null);
  const [musicFile, setMusicFile] = useState(null);
  const [customUrl, setCustomUrl] = useState("");

  const [selectedMusicType, setSelectedMusicType] = useState("original");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const audioRef = useRef(null);
  const emojiRainRef = useRef(null);
  const pageRef = useRef(null);
  const tiltRef = useRef(null);
  const confettiRef = useRef(null);
  const tiltRaf = useRef(0);
  const [gate, setGate] = useState("closed"); // closed -> opening -> gone

  // =========================
  // SUPABASE'DAN O'QISH
  // =========================
  useEffect(() => {
    const fetchInvitation = async () => {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("id");
      if (!id || params.get("d")) return; // ma'lumot havolaning o'zida bor

      setLoading(true);
      try {
        const { data: invData, error } = await supabase
          .from("invitations")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        if (invData) {
          setData({
            topText: invData.top_text || "",
            title: invData.title || "",
            subtitle: invData.subtitle || "",
            description: invData.description || "",
            firstName: invData.first_name || "",
            secondName: invData.second_name || "",
            day: invData.day || "",
            month: invData.month || "",
            year: invData.year || "",
            time: invData.time || "",
            weekday: invData.weekday || "",
            restaurant: invData.restaurant || "",
            address: invData.address || "",
            bottomText: invData.bottom_text || "",
          });
          setBackgroundImage(invData.bg_img || "");
          setCenterImage(invData.c_img || "");

          if (invData.music_url) {
            setMusicUrl(invData.music_url);
            if (!SAMPLE_TRACKS.some((t) => t.url === invData.music_url)) {
              setSelectedMusicType("custom");
            }
          }
          setStep("invitation");
        }
      } catch (error) {
        console.error("Taklifnomani yuklashda xatolik:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, []);

  // =========================
  // EMOJI YOMG'IRI
  // =========================
  useEffect(() => {
    const container = emojiRainRef.current;
    if (step !== "invitation" || !container) return;

    const items = [];
    const count = window.innerWidth < 600 ? 20 : 28; // на телефонах чуть меньше, чтобы не тормозило
    for (let i = 0; i < count; i++) {
      const emoji = document.createElement("span");
      emoji.className = "rain-emoji";
      emoji.innerHTML = RAIN_SHAPES[Math.floor(Math.random() * RAIN_SHAPES.length)];
      emoji.style.left = `${Math.random() * 100}%`;
      emoji.style.animationDuration = `${7 + Math.random() * 9}s`;
      emoji.style.animationDelay = `${Math.random() * 12}s`;
      emoji.style.setProperty("--drift", `${Math.random() * 140 - 70}px`);
      const size = 14 + Math.random() * 14;
      emoji.style.width = `${size}px`;
      emoji.style.height = `${size}px`;
      container.appendChild(emoji);
      items.push(emoji);
    }

    return () => items.forEach((item) => item.remove());
  }, [step]);

  // =========================
  // MUSIQA
  // =========================
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.35;
    audio.loop = true;

    const startMusic = () => {
      if (audio.paused) audio.play().catch(() => {});
    };

    startMusic();

    document.addEventListener("click", startMusic, { once: true });
    document.addEventListener("touchstart", startMusic, { once: true });
    document.addEventListener("keydown", startMusic, { once: true });

    return () => {
      document.removeEventListener("click", startMusic);
      document.removeEventListener("touchstart", startMusic);
      document.removeEventListener("keydown", startMusic);
    };
  }, [step, musicUrl]);

  const playMusicFromStart = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.35;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  };

  const toggleMusic = (e) => {
    e?.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  };

  // Yangi kuy tanlanganda src yangilangandan KEYIN ijro etiladi
  const playOnChange = useRef(false);

  useEffect(() => {
    if (!playOnChange.current) return;
    playOnChange.current = false;
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.35;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }, [musicUrl]);

  const switchTo = (url) => {
    if (url === musicUrl) {
      playMusicFromStart();
    } else {
      playOnChange.current = true;
      setMusicUrl(url);
    }
  };

  const pickTrack = (track) => {
    setSelectedMusicType("original");
    switchTo(track.url);
  };

  const pickCustom = () => {
    setSelectedMusicType("custom");
    if (customUrl) switchTo(customUrl);
    else playMusicFromStart();
  };

  const stepTrack = (dir) => {
    const idx = SAMPLE_TRACKS.findIndex((t) => t.url === musicUrl);
    const base = selectedMusicType === "original" && idx !== -1 ? idx : dir > 0 ? -1 : 0;
    const next = SAMPLE_TRACKS[(base + dir + SAMPLE_TRACKS.length) % SAMPLE_TRACKS.length];
    pickTrack(next);
  };

  // =========================
  // TAYMER (to'y kuniga qadar)
  // =========================
  useEffect(() => {
    if (step !== "invitation") return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [step]);

  const countdown = useMemo(() => {
    const monthIndex = MONTHS.indexOf(data.month);
    if (!data.day || !data.year || monthIndex === -1) return null;

    const [h, m] = (data.time || "00:00").split(":").map(Number);
    const target = new Date(Number(data.year), monthIndex, Number(data.day), h || 0, m || 0);
    const diff = target.getTime() - now;
    if (Number.isNaN(diff) || diff <= 0) return null;

    const s = Math.floor(diff / 1000);
    return {
      days: Math.floor(s / 86400),
      hours: Math.floor((s % 86400) / 3600),
      minutes: Math.floor((s % 3600) / 60),
      seconds: s % 60,
    };
  }, [data.day, data.month, data.year, data.time, now]);

  // =========================
  // KIRISH PARDASI, SKROLL ANIMATSIYALAR, 3D EFFEKT
  // =========================
  const isOpen = gate !== "closed";

  // Parda yopiq paytda sahifa aylanmasin
  useEffect(() => {
    if (step !== "invitation" || gate !== "closed") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [step, gate]);

  // Elementlar ekranga kirganda ketma-ket paydo bo'ladi
  useEffect(() => {
    if (step !== "invitation" || !isOpen) return;

    let io;
    const start = () => {
      const nodes = Array.from(document.querySelectorAll(".card-tilt .reveal"));
      if (!("IntersectionObserver" in window)) {
        nodes.forEach((n) => n.classList.add("in"));
        return;
      }
      let firstBatch = true;
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (!en.isIntersecting) return;
            // Pastda turgan elementlar skroll qilinganda kechikmasdan chiqadi
            if (!firstBatch) en.target.style.setProperty("--d", "0.05s");
            en.target.classList.add("in");
            io.unobserve(en.target);
          });
          firstBatch = false;
        },
        { threshold: 0.12 }
      );
      nodes.forEach((n) => io.observe(n));
    };

    const timer = setTimeout(start, gate === "opening" ? 380 : 0);
    return () => {
      clearTimeout(timer);
      io?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, isOpen]);

  const burstConfetti = () => {
    const box = confettiRef.current;
    if (!box || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const colors = ["#f2dca3", "#d9b86c", "#ffffff", "#f4b8cc", "#b5527a"];
    const ox = window.innerWidth / 2;
    const oy = window.innerHeight * 0.5;

    for (let i = 0; i < 70; i++) {
      const el = document.createElement("i");
      const size = 6 + Math.random() * 7;
      el.style.cssText =
        `position:absolute;left:${ox}px;top:${oy}px;width:${size}px;` +
        `height:${size * (Math.random() > 0.5 ? 1 : 0.45)}px;background:${colors[i % colors.length]};` +
        `border-radius:${Math.random() > 0.6 ? "50%" : "2px"};will-change:transform,opacity`;
      box.appendChild(el);

      const angle = Math.random() * Math.PI * 2;
      const dist = 140 + Math.random() * 320;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist - 120;
      const rot = (Math.random() - 0.5) * 900;

      const anim = el.animate(
        [
          { transform: "translate(-50%,-50%) scale(.2) rotate(0deg)", opacity: 1 },
          {
            transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1) rotate(${rot / 2}deg)`,
            opacity: 1,
            offset: 0.55,
          },
          {
            transform: `translate(calc(-50% + ${dx * 1.15}px), calc(-50% + ${dy + 260}px)) scale(.9) rotate(${rot}deg)`,
            opacity: 0,
          },
        ],
        {
          duration: 1600 + Math.random() * 1200,
          easing: "cubic-bezier(.2,.7,.3,1)",
          delay: Math.random() * 120,
        }
      );
      anim.onfinish = () => el.remove();
    }
  };

  const openGate = () => {
    if (gate !== "closed") return;
    playMusicFromStart();
    burstConfetti();
    setGate("opening");
    setTimeout(() => setGate("gone"), 1700);
  };

  const handleTilt = (e) => {
    if (e.pointerType !== "mouse" || !isOpen) return;
    const { clientX, clientY } = e;
    cancelAnimationFrame(tiltRaf.current);
    tiltRaf.current = requestAnimationFrame(() => {
      const page = pageRef.current;
      const tilt = tiltRef.current;
      if (!page || !tilt) return;
      const nx = clientX / window.innerWidth - 0.5;
      const ny = clientY / window.innerHeight - 0.5;
      const r = tilt.getBoundingClientRect();
      tilt.style.setProperty("--rx", `${(-ny * 6).toFixed(2)}deg`);
      tilt.style.setProperty("--ry", `${(nx * 8).toFixed(2)}deg`);
      tilt.style.setProperty("--gx", `${clientX - r.left}px`);
      tilt.style.setProperty("--gy", `${clientY - r.top}px`);
      page.style.setProperty("--px", nx.toFixed(3));
      page.style.setProperty("--py", ny.toFixed(3));
      tilt.classList.add("hovering");
    });
  };

  const resetTilt = () => {
    cancelAnimationFrame(tiltRaf.current);
    const page = pageRef.current;
    const tilt = tiltRef.current;
    if (tilt) {
      tilt.style.setProperty("--rx", "0deg");
      tilt.style.setProperty("--ry", "0deg");
      tilt.classList.remove("hovering");
    }
    if (page) {
      page.style.setProperty("--px", "0");
      page.style.setProperty("--py", "0");
    }
  };

  // =========================
  // HANDLERLAR
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((old) => ({ ...old, [name]: value }));
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const imageUrl = URL.createObjectURL(file);

    if (type === "background") {
      setBackgroundImage(imageUrl);
      setBgFile(file);
    }
    if (type === "center") {
      setCenterImage(imageUrl);
      setCenterFile(file);
    }
  };

  const handleMusicChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCustomUrl(url);
    setMusicUrl(url);
    setMusicFile(file);
    setSelectedMusicType("custom");
  };

  const uploadFileToStorage = async (file, bucketName) => {
    if (!file) return null;
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

      const { error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, { cacheControl: "3600", upsert: false });

      if (error) {
        console.warn("Storage upload warning:", error.message);
        return null;
      }

      const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
      return urlData?.publicUrl || null;
    } catch (err) {
      console.warn("Upload exception:", err);
      return null;
    }
  };

  const handleSaveAndPrepare = async () => {
    setSaving(true);
    try {
      let finalBgUrl = backgroundImage;
      let finalCenterUrl = centerImage;
      let finalMusicUrl = musicUrl;

      if (bgFile) {
        const url = await uploadFileToStorage(bgFile, "images");
        if (url) finalBgUrl = url;
      }
      if (centerFile) {
        const url = await uploadFileToStorage(centerFile, "images");
        if (url) finalCenterUrl = url;
      }
      if (selectedMusicType === "custom" && musicFile) {
        const url = await uploadFileToStorage(musicFile, "images");
        if (url) finalMusicUrl = url;
      }

      // Fayl yuklanmagan bo'lsa, faqat sizning telefoningizda ishlaydigan blob: havola qoladi.
      // Uni boshqalarga yubormaymiz.
      const failed = [];
      if (finalBgUrl && !safeUrl(finalBgUrl)) {
        finalBgUrl = "";
        failed.push("orqa fon rasmi");
      }
      if (finalCenterUrl && !safeUrl(finalCenterUrl)) {
        finalCenterUrl = "";
        failed.push("markaziy rasm");
      }
      if (finalMusicUrl && !safeUrl(finalMusicUrl)) {
        finalMusicUrl = SAMPLE_TRACKS[0].url;
        failed.push("o‘z musiqangiz");
      }

      const newId = Date.now().toString();

      const insertPayload = {
        id: newId,
        top_text: data.topText,
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        first_name: data.firstName,
        second_name: data.secondName,
        day: data.day,
        month: data.month,
        year: data.year,
        time: data.time,
        weekday: data.weekday,
        restaurant: data.restaurant,
        address: data.address,
        bottom_text: data.bottomText,
        bg_img: finalBgUrl || "",
        c_img: finalCenterUrl || "",
      };

      // Baza javob bermasa ham taklifnoma ishlayveradi: ma'lumotlar havolaning o'zida bor
      try {
        let { error } = await supabase
          .from("invitations")
          .insert([{ ...insertPayload, music_url: finalMusicUrl || "" }]);

        if (error && error.message && error.message.includes("music_url")) {
          console.warn("music_url ustuni bazada yo'q. Ustunsiz saqlanmoqda...");
          const fallbackRes = await supabase.from("invitations").insert([insertPayload]);
          error = fallbackRes.error;
        }

        if (error) console.warn("Bazaga saqlab bo'lmadi (havola baribir ishlaydi):", error.message || error);
      } catch (dbError) {
        console.warn("Bazaga ulanib bo'lmadi (havola baribir ishlaydi):", dbError);
      }

      const shareData = toBase64Url({
        data,
        bgImg: finalBgUrl,
        cImg: finalCenterUrl,
        musicUrl: finalMusicUrl,
      });
      const newUrl = `${window.location.origin}${window.location.pathname}?id=${newId}&d=${shareData}`;
      window.history.pushState({ path: newUrl }, "", newUrl);

      setBackgroundImage(finalBgUrl);
      setCenterImage(finalCenterUrl);
      setMusicUrl(finalMusicUrl);
      playMusicFromStart();
      setIsCreator(true);
      setGate("gone");
      setStep("invitation");
      window.scrollTo({ top: 0 });

      if (failed.length) {
        alert(
          `Diqqat: ${failed.join(", ")} serverga yuklanmadi, shuning uchun boshqalarga ko‘rinmaydi. ` +
            "Matnlar, sana va manzil esa havola orqali to‘liq ochiladi."
        );
      }
    } catch (error) {
      console.error("Saqlashda xatolik yuz berdi:", error);
      alert("Xatolik yuz berdi: " + (error.message || "Iltimos qayta urinib ko'ring."));
    } finally {
      setSaving(false);
    }
  };

  const handleShare = () => {
    const shareUrl = window.location.href;

    if (navigator.share) {
      navigator
        .share({
          title: `${data.firstName} & ${data.secondName} To'y Taklifnomasi`,
          text: "Sizni to'yimizga taklif etamiz!",
          url: shareUrl,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const globalAudio = (
    <audio
      ref={audioRef}
      src={musicUrl}
      preload="auto"
      loop
      onPlay={() => setIsPlaying(true)}
      onPause={() => setIsPlaying(false)}
    />
  );

  const musicToggle = (
    <button className="music-toggle" onClick={toggleMusic} aria-label="Musiqani boshqarish">
      {isPlaying ? (
        <span className="eq" aria-hidden="true">
          <i /><i /><i /><i />
        </span>
      ) : (
        <MuteIcon />
      )}
    </button>
  );

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="loading-screen">
        {globalAudio}
        <div className="loading-box">
          <div className="loader-ring" />
          <p>Yuklanmoqda</p>
        </div>
      </div>
    );
  }

  // =========================
  // 1-BOSQICH: HOME
  // =========================
  if (step === "home") {
    return (
      <>
        {globalAudio}

        <div
          className="home-page"
          style={{ backgroundImage: "url('https://aniq.uz/photos/news/zLvhjXoa0mshkyx.jpeg')" }}
        >
          <div className="home-overlay" />

          <div className="aurora" aria-hidden="true">
            <i /><i /><i />
          </div>

          <div className="sparkles" aria-hidden="true">
            {SPARKLES.map((s, i) => (
              <i key={i} style={{ left: s.left, top: s.top, animationDelay: s.delay, animationDuration: s.duration }} />
            ))}
          </div>

          <div className="home-content">
            <p className="home-label">TAKLIFNOMA</p>
            <h1>
              Sizning maxsus
              <br />
              kuningiz
            </h1>
            <div className="home-line" />
            <p className="home-description">
              Yaqinlaringiz uchun chiroyli va
              <br />
              unutilmas taklifnoma yarating.
            </p>

            <button
              className="main-button"
              onClick={() => {
                playMusicFromStart();
                setIsCreator(true);
                setStep("editor");
              }}
            >
              Taklifnoma yaratish
              <span>→</span>
            </button>
          </div>
        </div>
      </>
    );
  }

  // =========================
  // 2-BOSQICH: EDITOR
  // =========================
  if (step === "editor") {
    return (
      <>
        {globalAudio}

        <div className="editor-page">
          <div className="editor-container">
            <button
              className="back-button"
              onClick={() => {
                playMusicFromStart();
                setStep("home");
              }}
            >
              ← Orqaga
            </button>

            <div className="editor-header">
              <p>TAKLIFNOMA YARATISH</p>
              <h1>Ma’lumotlaringizni kiriting</h1>
              <span>Quyidagi maydonlarni o‘zingizga mos qilib to‘ldiring.</span>
            </div>

            <div className="form-card">
              {/* ASOSIY */}
              <div className="form-section">
                <h2>Asosiy yozuvlar</h2>
                <div className="form-grid">
                  <label>
                    Yuqoridagi yozuv
                    <input name="topText" value={data.topText} onChange={handleChange} placeholder="To‘ldiring..." />
                  </label>
                  <label>
                    Asosiy sarlavha
                    <input name="title" value={data.title} onChange={handleChange} placeholder="To‘ldiring..." />
                  </label>
                  <label className="full-width">
                    Sarlavha ostidagi yozuv
                    <input name="subtitle" value={data.subtitle} onChange={handleChange} placeholder="To‘ldiring..." />
                  </label>
                  <label className="full-width">
                    Taklif matni
                    <textarea name="description" value={data.description} onChange={handleChange} placeholder="To‘ldiring..." />
                  </label>
                </div>
              </div>

              {/* ISMLAR */}
              <div className="form-section">
                <h2>Ismlar</h2>
                <div className="form-grid">
                  <label>
                    Birinchi ism
                    <input name="firstName" value={data.firstName} onChange={handleChange} placeholder="To‘ldiring..." />
                  </label>
                  <label>
                    Ikkinchi ism
                    <input name="secondName" value={data.secondName} onChange={handleChange} placeholder="To‘ldiring..." />
                  </label>
                </div>
              </div>

              {/* SANA VA VAQT */}
              <div className="form-section">
                <h2>Sana va vaqt</h2>
                <div className="form-grid">
                  <label>
                    Kun
                    <select name="day" value={data.day} onChange={handleChange} className="select-input">
                      <option value="" disabled>Kunni tanlang</option>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Oy
                    <select name="month" value={data.month} onChange={handleChange} className="select-input">
                      <option value="" disabled>Oyni tanlang</option>
                      {MONTHS.map((m) => (
                        <option key={m} value={m}>{m.charAt(0) + m.slice(1).toLowerCase()}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Yil
                    <select name="year" value={data.year} onChange={handleChange} className="select-input">
                      <option value="" disabled>Yilni tanlang</option>
                      {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() + i).map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Vaqt
                    <input type="time" name="time" value={data.time} onChange={handleChange} />
                  </label>

                  <label className="full-width">
                    Hafta kuni
                    <select name="weekday" value={data.weekday} onChange={handleChange} className="select-input">
                      <option value="" disabled>Kunni tanlang</option>
                      {WEEKDAYS.map((w) => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              {/* MANZIL */}
              <div className="form-section">
                <h2>To‘y joyi</h2>
                <div className="form-grid">
                  <label>
                    Restoran / To‘yxona
                    <input name="restaurant" value={data.restaurant} onChange={handleChange} placeholder="To‘ldiring..." />
                  </label>
                  <label>
                    Manzil
                    <input name="address" value={data.address} onChange={handleChange} placeholder="To‘ldiring..." />
                  </label>
                </div>
              </div>

              {/* MUSIQA */}
              <div className="form-section">
                <h2>Musiqa sozlamasi</h2>
                <MusicPlayer
                  audioRef={audioRef}
                  isPlaying={isPlaying}
                  tracks={SAMPLE_TRACKS}
                  type={selectedMusicType}
                  musicUrl={musicUrl}
                  musicFile={musicFile}
                  customUrl={customUrl}
                  onPickTrack={pickTrack}
                  onPickCustom={pickCustom}
                  onFile={handleMusicChange}
                  onToggle={toggleMusic}
                  onStep={stepTrack}
                />
              </div>

              {/* RASMLAR */}
              <div className="form-section">
                <h2>Rasmlar</h2>
                <div className="image-upload-grid">
                  <div className="upload-box-wrapper">
                    <label className="upload-box">
                      <span className="upload-icon">✦</span>
                      <strong>Orqa fon rasmi</strong>
                      <small>Telefondan rasm tanlash</small>
                      <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, "background")} />
                      {backgroundImage && <img className="upload-preview" src={backgroundImage} alt="Fon preview" />}
                    </label>

                    <div className="sample-images-wrapper">
                      <small>Yoki tayyor namunalardan tanlang:</small>
                      <div className="sample-images">
                        {BACKGROUND_SAMPLES.map((imgUrl, index) => (
                          <img
                            key={index}
                            src={imgUrl}
                            alt={`Fon namuna ${index + 1}`}
                            className={`sample-thumb ${backgroundImage === imgUrl ? "selected" : ""}`}
                            onClick={() => {
                              setBackgroundImage(imgUrl);
                              setBgFile(null);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="upload-box-wrapper">
                    <label className="upload-box">
                      <span className="upload-icon">♡</span>
                      <strong>Markaziy rasm</strong>
                      <small>Telefondan rasm tanlash</small>
                      <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, "center")} />
                      {centerImage && <img className="upload-preview" src={centerImage} alt="Markaziy rasm preview" />}
                    </label>

                    <div className="sample-images-wrapper">
                      <small>Yoki tayyor namunalardan tanlang:</small>
                      <div className="sample-images">
                        {CENTER_SAMPLES.map((imgUrl, index) => (
                          <img
                            key={index}
                            src={imgUrl}
                            alt={`Markaziy namuna ${index + 1}`}
                            className={`sample-thumb ${centerImage === imgUrl ? "selected" : ""}`}
                            onClick={() => {
                              setCenterImage(imgUrl);
                              setCenterFile(null);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* YAKUN */}
              <div className="form-section">
                <h2>Yakuniy yozuv</h2>
                <div className="form-grid">
                  <label className="full-width">
                    Pastdagi yozuv
                    <input name="bottomText" value={data.bottomText} onChange={handleChange} placeholder="To‘ldiring..." />
                  </label>
                </div>
              </div>

              <button className="prepare-button" onClick={handleSaveAndPrepare} disabled={saving}>
                {saving ? "Saqlanmoqda..." : "Taklifnomani tayyorlash"} {!saving && <span>→</span>}
              </button>
            </div>
          </div>
        </div>

        {musicToggle}
      </>
    );
  }

  // =========================
  // 3-BOSQICH: INVITATION
  // =========================
  const cells = countdown
    ? [
        ["Kun", countdown.days],
        ["Soat", countdown.hours],
        ["Daqiqa", countdown.minutes],
        ["Soniya", countdown.seconds],
      ]
    : null;

  const monogram =
    [initialOf(data.firstName), initialOf(data.secondName)].filter(Boolean).join("&") || "✦";

  return (
    <>
      {globalAudio}

      <div
        ref={pageRef}
        className={`invitation-page ${isOpen ? "is-open" : ""}`}
        style={backgroundImage ? { "--bg-image": `url("${backgroundImage}")` } : {}}
        onPointerMove={handleTilt}
        onPointerLeave={resetTilt}
      >
        <div className="invitation-overlay" />

        <div className="dust" aria-hidden="true">
          {DUST.map((d, i) => (
            <i
              key={i}
              style={{
                left: d.left,
                width: d.size,
                height: d.size,
                animationDelay: d.delay,
                animationDuration: d.duration,
                "--sway": d.sway,
              }}
            />
          ))}
        </div>

        <div className="emoji-rain" ref={emojiRainRef} aria-hidden="true" />

        <div className="card-tilt" ref={tiltRef}>
          <div className="invitation-card">
            <span className="card-edge" aria-hidden="true" />
            <span className="card-glare" aria-hidden="true" />

            <p className="invitation-top reveal" style={{ "--d": "0.2s" }}>{data.topText}</p>
            <h1>{data.title}</h1>

            <div className="divider-ornament reveal" style={{ "--d": "0.5s" }}>
              <span className="star">✦</span>
            </div>

            <h2 className="reveal" style={{ "--d": "0.6s" }}>{data.subtitle}</h2>
            <p className="invitation-description reveal" style={{ "--d": "0.75s" }}>{data.description}</p>

            {centerImage && (
              <div className="center-photo-wrapper">
                <img className="center-photo" src={centerImage} alt="Taklifnoma" />
              </div>
            )}

            <div className="couple-names reveal reveal-plain" style={{ "--d": "0.9s" }}>
              <SplitText text={data.firstName} />
              <b>&</b>
              <SplitText text={data.secondName} />
            </div>

            <div className="date-info reveal" style={{ "--d": "1.05s" }}>
              <div className="date-item">
                <strong>{data.day}</strong>
                <span>{data.month}</span>
                <small>{data.year}</small>
              </div>

              <div className="date-divider" />

              <div className="date-item">
                <strong>{data.time}</strong>
                <span>BOSHLANISHI</span>
                <small>{data.weekday}</small>
              </div>
            </div>

            {cells && (
              <div className="countdown reveal" style={{ "--d": "1.2s" }}>
                {cells.map(([label, value]) => (
                  <div className="count-cell" key={label}>
                    <strong key={value}>{String(value).padStart(2, "0")}</strong>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="venue reveal" style={{ "--d": "1.3s" }}>
              <div className="venue-icon"><PinIcon /></div>
              <div>
                <strong>{data.restaurant}</strong>
                <p>{data.address}</p>
              </div>
            </div>

            <p className="invitation-bottom reveal" style={{ "--d": "1.45s" }}>{data.bottomText}</p>

            <button
              className={`share-button reveal ${copied ? "copied" : ""}`}
              style={{ "--d": "1.6s" }}
              onClick={handleShare}
            >
              <span className="share-icon">{copied ? "✓" : "✦"}</span>
              <span>{copied ? "Nusxalandi!" : "Ulashish"}</span>
            </button>
          </div>
        </div>

        {isCreator && (
          <button
            className="edit-floating"
            onClick={() => {
              playMusicFromStart();
              setStep("editor");
            }}
          >
            <span>✏️</span>
            <span>Tahrirlash</span>
          </button>
        )}
      </div>

      {musicToggle}

      {/* KIRISH PARDASI (faqat taklifnomani ko'rayotgan mehmonlar uchun) */}
      {gate !== "gone" && (
        <div className={`gate ${gate}`} role="dialog" aria-modal="true" aria-label="Taklifnomani ochish">
          <div className="gate-half left" />
          <div className="gate-half right" />

          <div className="sparkles" aria-hidden="true">
            {SPARKLES.map((s, i) => (
              <i
                key={i}
                style={{ left: s.left, top: s.top, animationDelay: s.delay, animationDuration: s.duration }}
              />
            ))}
          </div>

          <div className="gate-content">
            <p className="gate-eyebrow">Maxsus taklifnoma</p>
            <h2 className="gate-title">
              Siz taklif
              <br />
              etilgansiz
            </h2>

            {(data.firstName || data.secondName) && (
              <p className="gate-names">
                {data.firstName} <span>&</span> {data.secondName}
              </p>
            )}

            <button type="button" className="seal" onClick={openGate} aria-label="Taklifnomani ochish">
              <span className="seal-ring" />
              <span className="seal-text">{monogram}</span>
            </button>

            <p className="gate-hint">Ochish uchun bosing</p>
          </div>
        </div>
      )}

      <div className="confetti" ref={confettiRef} aria-hidden="true" />
    </>
  );
}

export default App;

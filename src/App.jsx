import React, { useState, useRef, useEffect } from "react";
import {
  Heart, MessageCircle, Share2, Home, Radio, User, Plus, Search,
  X, Send, Users, ChevronLeft, Music2, UserPlus, Check, Mic2,
  Mic, Square, SplitSquareVertical, TrendingUp, Sliders, Layers,
  Video, Sparkles, MicOff,
} from "lucide-react";

/* ---------------------------------------------------------
   SETLIST — a stage for songs in progress
   Tokens:
   bg #0D0B14 · surface #17141F · surface-2 #201C2C
   text #F3EFEA · muted #948FA3
   gels: amber #F5A623 · violet #7C5CFF · pink #FF4D8D · blue #4D7CFF
   live #FF3B3B
--------------------------------------------------------- */

const GELS = {
  amber: "#F5A623",
  violet: "#7C5CFF",
  pink: "#FF4D8D",
  blue: "#4D7CFF",
};

const GRADIENTS = [
  [GELS.amber, GELS.pink],
  [GELS.violet, GELS.blue],
  [GELS.pink, GELS.violet],
  [GELS.blue, GELS.amber],
  [GELS.amber, GELS.violet],
  [GELS.pink, GELS.blue],
];

const CLIPS = [
  { id: 1, artist: "Nova Resin", handle: "@novaresin", title: "Static Bloom", genre: "Bedroom Pop", likes: 4821, comments: 212, g: GRADIENTS[0] },
  { id: 2, artist: "Kilowatt Kid", handle: "@kilowattkid", title: "Concrete Halo", genre: "Hyperpop", likes: 9042, comments: 588, g: GRADIENTS[1] },
  { id: 3, artist: "Marrow & Moss", handle: "@marrowmoss", title: "Low Tide Hymn", genre: "Indie Folk", likes: 2310, comments: 97, g: GRADIENTS[2] },
  { id: 4, artist: "DJ Amaranth", handle: "@djamaranth", title: "Nine Lives House Edit", genre: "House", likes: 15302, comments: 1044, g: GRADIENTS[3] },
  { id: 5, artist: "Glass Feather", handle: "@glassfeather", title: "Slow Static", genre: "Synthwave", likes: 6650, comments: 340, g: GRADIENTS[4] },
  { id: 6, artist: "Obi & The Drift", handle: "@obithedrift", title: "Lagos to Lisbon", genre: "Afrobeat", likes: 3908, comments: 165, g: GRADIENTS[5] },
];

const LIVES = [
  { id: 101, artist: "Nova Resin", handle: "@novaresin", title: "writing a chorus live, send prompts", genre: "Bedroom Pop", viewers: 1284, g: GRADIENTS[0], hosts: ["Kilowatt Kid"], fx: { vocal: ["Reverb"], video: [] } },
  { id: 102, artist: "DJ Amaranth", handle: "@djamaranth", title: "late night house set — vol. 4 (b2b)", genre: "House", viewers: 6710, g: GRADIENTS[3], hosts: ["Sable & Sax"], fx: { vocal: [], video: ["Neon Glow"] } },
  { id: 103, artist: "Two Rivers", handle: "@tworivers", title: "acoustic requests until 2am", genre: "Indie Folk", viewers: 442, g: GRADIENTS[2], hosts: [], fx: { vocal: [], video: [] } },
  { id: 104, artist: "Kilowatt Kid", handle: "@kilowattkid", title: "mixing 'Concrete Halo' pt. 2", genre: "Hyperpop", viewers: 2033, g: GRADIENTS[1], hosts: [], fx: { vocal: ["Autotune", "Robot"], video: ["Strobe"] } },
  { id: 105, artist: "Sable & Sax", handle: "@sableandsax", title: "jazz fusion jam, open sit-in", genre: "Jazz Fusion", viewers: 318, g: GRADIENTS[4], hosts: ["Two Rivers", "Obi & The Drift"], fx: { vocal: [], video: [] } },
  { id: 106, artist: "Obi & The Drift", handle: "@obithedrift", title: "soundcheck before tonight's show", genre: "Afrobeat", viewers: 891, g: GRADIENTS[5], hosts: [], fx: { vocal: [], video: ["Warm"] } },
];

const ARTISTS = Array.from(
  new Map([...CLIPS, ...LIVES].map((i) => [i.handle, i])).values()
);

const CHAT_SEED = [
  { user: "reedmaker", text: "that chord change is everything" },
  { user: "juno_static", text: "wait go back to the bridge" },
  { user: "priya.k", text: "🔥🔥🔥" },
  { user: "loafbread", text: "what tuning is that" },
  { user: "coastwise", text: "this is going straight to my playlist" },
];

const COMMENT_TEMPLATES = [
  { user: "reedmaker", text: "the transition into the hook is insane" },
  { user: "juno_static", text: "need the stems for this" },
  { user: "priya.k", text: "on repeat since this morning" },
  { user: "loafbread", text: "what plugin is that reverb" },
  { user: "coastwise", text: "this belongs on a festival stage" },
];

const GENRE_CHIPS = ["All", "House", "Bedroom Pop", "Hyperpop", "Indie Folk", "Jazz Fusion", "Afrobeat", "Synthwave"];

const VOCAL_FX = ["Reverb", "Autotune", "Echo", "Robot", "Chorus"];
const VIDEO_FX = ["Neon Glow", "Grain", "Mono", "Strobe", "Warm"];
const VIDEO_FX_CSS = {
  "Neon Glow": "saturate(1.6) contrast(1.15)",
  "Grain": "contrast(1.15) brightness(0.94) saturate(0.9)",
  "Mono": "grayscale(1)",
  "Strobe": "contrast(1.2)",
  "Warm": "sepia(0.35) saturate(1.3)",
};
function combineVideoFx(active) {
  if (!active.length) return {};
  const filter = active.map((f) => VIDEO_FX_CSS[f]).join(" ");
  const style = { filter };
  if (active.includes("Neon Glow")) style.boxShadow = `0 0 22px ${GELS.violet}77`;
  if (active.includes("Strobe")) style.animation = "strobe 0.7s steps(2) infinite";
  return style;
}
const LAYER_TYPES = ["Vocals", "Drums", "Synth", "Bass", "Keys"];

function fmtNum(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
}

function fmtTime(s) {
  const m = String(Math.floor(s / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return `${m}:${sec}`;
}

function useViewportSize() {
  const compute = () =>
    typeof window !== "undefined"
      ? { width: window.innerWidth, height: window.innerHeight }
      : { width: 1024, height: 768 };
  const [size, setSize] = useState(compute());
  useEffect(() => {
    const onResize = () => setSize(compute());
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    onResize();
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);
  return size;
}

function SideNav({ screen, setScreen, onUpload }) {
  const items = [
    { key: "feed", icon: Home, label: "Feed" },
    { key: "live", icon: Radio, label: "Live" },
    { key: "profile", icon: User, label: "Profile" },
  ];
  return (
    <div style={{ width: 240, flexShrink: 0, height: "100%", borderRight: "1px solid rgba(255,255,255,0.06)", padding: "22px 16px", display: "flex", flexDirection: "column", background: "#0D0B14" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 8px 26px" }}>
        <Mic2 size={19} color={GELS.amber} />
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, letterSpacing: 1, color: "#F3EFEA" }}>SETLIST</span>
      </div>
      <button
        onClick={onUpload}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 14px", borderRadius: 12, border: "none", cursor: "pointer", background: `linear-gradient(135deg, ${GELS.amber}, ${GELS.pink})`, color: "#0D0B14", fontFamily: "Inter", fontWeight: 700, fontSize: 13.5, marginBottom: 22 }}
      >
        <Plus size={16} /> Create
      </button>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {items.map(({ key, icon: Icon, label }) => {
          const active = screen === key;
          return (
            <button
              key={key}
              onClick={() => setScreen(key)}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: 10, border: "none", cursor: "pointer", background: active ? "rgba(124,92,255,0.16)" : "transparent", color: active ? "#F3EFEA" : "#948FA3", fontFamily: "Inter", fontWeight: 600, fontSize: 14 }}
            >
              <Icon size={19} strokeWidth={active ? 2.3 : 1.8} /> {label}
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 10, padding: "10px 8px" }}>
        <GelCard g={GRADIENTS[4]} style={{ width: 34, height: 34, borderRadius: 999 }} />
        <div>
          <p style={{ margin: 0, fontFamily: "Inter", fontSize: 12.5, fontWeight: 600, color: "#F3EFEA" }}>Glass Feather</p>
          <p style={{ margin: 0, fontFamily: "Inter", fontSize: 10.5, color: "#948FA3" }}>@glassfeather</p>
        </div>
      </div>
    </div>
  );
}

function Waveform({ bars = 24, height = 28, color = "#F3EFEA", opacity = 0.9, gap = 3 }) {
  const heights = useRef(
    Array.from({ length: bars }, () => 0.25 + Math.random() * 0.75)
  ).current;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", height, gap }}>
      {heights.map((h, i) => (
        <div
          key={i}
          className="eq-bar"
          style={{
            width: 3,
            borderRadius: 2,
            background: color,
            opacity,
            height: `${h * 100}%`,
            animationDelay: `${(i % 7) * 0.09}s`,
            animationDuration: `${0.7 + (i % 5) * 0.12}s`,
          }}
        />
      ))}
    </div>
  );
}

function GelCard({ g, children, style }) {
  return (
    <div
      style={{
        background: `linear-gradient(155deg, ${g[0]} 0%, ${g[1]} 100%)`,
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(120% 90% at 15% 0%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 100%)",
        }}
      />
      {children}
    </div>
  );
}

function LiveBadge({ small }) {
  return (
    <div
      className="pulse-ring"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: "#FF3B3B",
        color: "#fff",
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 500,
        fontSize: small ? 10 : 11,
        letterSpacing: 0.5,
        padding: small ? "2px 6px" : "3px 8px",
        borderRadius: 4,
      }}
    >
      <span style={{ width: 5, height: 5, borderRadius: 999, background: "#fff" }} />
      LIVE
    </div>
  );
}

function HostStack({ names, size = 20 }) {
  if (!names.length) return null;
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {names.map((n, i) => {
        const g = GRADIENTS[(n.length + i) % GRADIENTS.length];
        return (
          <div
            key={n}
            title={n}
            style={{
              width: size, height: size, borderRadius: 999, marginLeft: i === 0 ? 0 : -6,
              border: "1.5px solid #0D0B14", background: `linear-gradient(135deg, ${g[0]}, ${g[1]})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "Inter", fontWeight: 700, fontSize: size * 0.42, color: "#0D0B14",
            }}
          >
            {n[0]}
          </div>
        );
      })}
    </div>
  );
}

function FxChip({ label, small }) {
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 3,
        background: "rgba(124,92,255,0.85)", color: "#0D0B14",
        fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
        fontSize: small ? 9 : 10, padding: small ? "2px 5px" : "2px 7px",
        borderRadius: 4, letterSpacing: 0.3,
      }}
    >
      <Sparkles size={small ? 8 : 9} /> {label.toUpperCase()}
    </span>
  );
}

function BottomNav({ screen, setScreen, onUpload }) {
  const items = [
    { key: "feed", icon: Home, label: "Feed" },
    { key: "live", icon: Radio, label: "Live" },
    { key: "upload", icon: Plus, label: "" },
    { key: "profile", icon: User, label: "Profile" },
  ];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        padding: "10px 8px calc(10px + env(safe-area-inset-bottom))",
        background: "rgba(13,11,20,0.88)",
        backdropFilter: "blur(10px)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        flexShrink: 0,
      }}
    >
      {items.map(({ key, icon: Icon, label }) => {
        if (key === "upload") {
          return (
            <button
              key={key}
              onClick={onUpload}
              style={{
                width: 44,
                height: 44,
                borderRadius: 999,
                border: "none",
                background: `linear-gradient(135deg, ${GELS.amber}, ${GELS.pink})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(255,77,141,0.35)",
              }}
            >
              <Icon size={22} color="#0D0B14" strokeWidth={2.5} />
            </button>
          );
        }
        const active = screen === key;
        return (
          <button
            key={key}
            onClick={() => setScreen(key)}
            style={{
              background: "none",
              border: "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              padding: "4px 14px",
              cursor: "pointer",
              color: active ? "#F3EFEA" : "#948FA3",
            }}
          >
            <Icon size={21} strokeWidth={active ? 2.4 : 1.8} />
            <span style={{ fontSize: 10, fontFamily: "Inter", fontWeight: 500 }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

function TopBar({ title, onSearch }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 16px 10px",
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <Mic2 size={16} color={GELS.amber} />
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 1, color: "#F3EFEA" }}>
          {title}
        </span>
      </div>
      <button onClick={onSearch} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
        <Search size={19} color="#948FA3" />
      </button>
    </div>
  );
}

const miniLabel = { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#0D0B14", fontWeight: 500 };
const iconBtn = { background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 };

function FeedCard({ clip, liked, onLike, onComment, onRemix, commentExtra }) {
  const isLiked = !!liked[clip.id];
  return (
    <div style={{ height: "100%", scrollSnapAlign: "start", flexShrink: 0, position: "relative", padding: "0 12px 12px" }}>
      <GelCard g={clip.g} style={{ height: "100%", borderRadius: 18, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 18 }}>
        <div style={{ position: "relative", zIndex: 1 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.85)", background: "rgba(0,0,0,0.28)", padding: "3px 8px", borderRadius: 4, letterSpacing: 0.5 }}>
            {clip.genre.toUpperCase()}
          </span>
          <div style={{ margin: "14px 0 10px" }}>
            <Waveform bars={28} height={34} color="#0D0B14" opacity={0.5} />
          </div>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, lineHeight: 1.05, color: "#0D0B14", margin: 0, letterSpacing: 0.5 }}>
            {clip.title}
          </h2>
          <p style={{ fontFamily: "Inter", fontSize: 13, fontWeight: 600, color: "rgba(13,11,20,0.75)", margin: "4px 0 0" }}>
            {clip.artist} <span style={{ fontWeight: 400 }}>{clip.handle}</span>
          </p>
        </div>

        <div style={{ position: "absolute", right: 14, bottom: 90, display: "flex", flexDirection: "column", alignItems: "center", gap: 16, zIndex: 1 }}>
          <button onClick={() => onLike(clip.id)} style={iconBtn}>
            <Heart size={26} color={isLiked ? "#FF3B3B" : "#0D0B14"} fill={isLiked ? "#FF3B3B" : "none"} strokeWidth={2} />
            <span style={miniLabel}>{fmtNum(clip.likes + (isLiked ? 1 : 0))}</span>
          </button>
          <button onClick={() => onComment(clip)} style={iconBtn}>
            <MessageCircle size={25} color="#0D0B14" strokeWidth={2} />
            <span style={miniLabel}>{fmtNum(clip.comments + commentExtra)}</span>
          </button>
          <button onClick={() => onRemix(clip)} style={iconBtn}>
            <SplitSquareVertical size={24} color="#0D0B14" strokeWidth={2} />
            <span style={miniLabel}>Duet</span>
          </button>
          <button style={iconBtn}>
            <Share2 size={23} color="#0D0B14" strokeWidth={2} />
            <span style={miniLabel}>Share</span>
          </button>
        </div>
      </GelCard>
    </div>
  );
}

function FeedScreen({ liked, onLike, onSearch, onComment, onRemix, commentsState }) {
  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
      <TopBar title="SETLIST" onSearch={onSearch} />
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", scrollSnapType: "y mandatory" }} className="no-scrollbar">
        {CLIPS.map((c) => (
          <FeedCard
            key={c.id}
            clip={c}
            liked={liked}
            onLike={onLike}
            onComment={onComment}
            onRemix={onRemix}
            commentExtra={(commentsState[c.id] || []).length}
          />
        ))}
      </div>
    </div>
  );
}

function LiveRailItem({ item, onOpen }) {
  return (
    <button onClick={() => onOpen(item)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, width: 68, flexShrink: 0 }}>
      <div className="pulse-ring-avatar" style={{ width: 58, height: 58, borderRadius: 999, padding: 2.5, background: "#FF3B3B" }}>
        <GelCard g={item.g} style={{ width: "100%", height: "100%", borderRadius: 999, border: "2px solid #0D0B14" }} />
      </div>
      <span style={{ fontFamily: "Inter", fontSize: 10.5, color: "#F3EFEA", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 66 }}>
        {item.handle}
      </span>
    </button>
  );
}

function LiveGridCard({ item, onOpen }) {
  const fxCount = (item.fx?.vocal.length || 0) + (item.fx?.video.length || 0);
  return (
    <button onClick={() => onOpen(item)} style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}>
      <GelCard g={item.g} style={{ ...combineVideoFx(item.fx?.video || []), borderRadius: 14, height: 118, padding: 10, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ display: "flex", justifyContent: "space-between", zIndex: 1, position: "relative" }}>
          <LiveBadge small />
          <span style={{ display: "flex", alignItems: "center", gap: 3, background: "rgba(0,0,0,0.32)", color: "#fff", fontFamily: "'JetBrains Mono', monospace", fontSize: 10, padding: "2px 6px", borderRadius: 4 }}>
            <Users size={10} /> {fmtNum(item.viewers)}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", zIndex: 1, position: "relative" }}>
          <Waveform bars={14} height={18} color="#0D0B14" opacity={0.4} />
          {fxCount > 0 && (
            <span style={{ background: "rgba(0,0,0,0.32)", borderRadius: 4, padding: "2px 4px", display: "flex", alignItems: "center" }}>
              <Sparkles size={10} color="#fff" />
            </span>
          )}
        </div>
      </GelCard>
      <div style={{ padding: "8px 2px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <p style={{ margin: 0, fontFamily: "Inter", fontSize: 12.5, fontWeight: 600, color: "#F3EFEA" }}>{item.artist}</p>
          {item.hosts?.length > 0 && <HostStack names={item.hosts} size={15} />}
        </div>
        <p style={{ margin: "2px 0 0", fontFamily: "Inter", fontSize: 11, color: "#948FA3", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {item.title}
        </p>
      </div>
    </button>
  );
}

const sectionLabel = { fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, letterSpacing: 1, color: "#948FA3", margin: "8px 0" };

function LiveScreen({ onOpen, onSearch }) {
  const [genre, setGenre] = useState("All");
  const filtered = genre === "All" ? LIVES : LIVES.filter((l) => l.genre === genre);
  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
      <TopBar title="LIVE" onSearch={onSearch} />
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }} className="no-scrollbar">
        <div style={{ padding: "2px 16px 4px" }}>
          <p style={sectionLabel}>ON STAGE NOW</p>
        </div>
        <div style={{ display: "flex", gap: 14, overflowX: "auto", padding: "0 16px 16px" }} className="no-scrollbar">
          {LIVES.map((l) => (
            <LiveRailItem key={l.id} item={l} onOpen={onOpen} />
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "0 16px 14px" }} className="no-scrollbar">
          {GENRE_CHIPS.map((g) => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              style={{
                flexShrink: 0,
                padding: "6px 13px",
                borderRadius: 999,
                fontSize: 12,
                fontFamily: "Inter",
                fontWeight: 500,
                border: "1px solid " + (genre === g ? "transparent" : "rgba(255,255,255,0.12)"),
                background: genre === g ? GELS.violet : "transparent",
                color: genre === g ? "#0D0B14" : "#C9C4D6",
                cursor: "pointer",
              }}
            >
              {g}
            </button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 14, padding: "0 16px 24px" }}>
          {filtered.map((l) => (
            <LiveGridCard key={l.id} item={l} onOpen={onOpen} />
          ))}
        </div>
      </div>
    </div>
  );
}

function LiveDetailScreen({ item, onBack }) {
  const [messages, setMessages] = useState(CHAT_SEED);
  const [draft, setDraft] = useState("");
  const [following, setFollowing] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    if (!draft.trim()) return;
    setMessages((m) => [...m, { user: "you", text: draft.trim() }]);
    setDraft("");
  };

  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
      <GelCard g={item.g} style={{ ...combineVideoFx(item.fx?.video || []), height: "40%", flexShrink: 0, position: "relative" }}>
        <button onClick={onBack} style={{ position: "absolute", top: 14, left: 14, zIndex: 2, background: "rgba(0,0,0,0.35)", border: "none", borderRadius: 999, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <ChevronLeft size={19} color="#fff" />
        </button>
        <div style={{ position: "absolute", top: 14, right: 14, zIndex: 2, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <LiveBadge />
          {item.hosts?.length > 0 && (
            <span style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(0,0,0,0.32)", color: "#fff", fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, padding: "2px 6px", borderRadius: 4 }}>
              <Users size={9} /> co-hosting
            </span>
          )}
        </div>
        {(item.fx?.vocal.length > 0 || item.fx?.video.length > 0) && (
          <div style={{ position: "absolute", bottom: 60, left: 14, zIndex: 2, display: "flex", gap: 5, flexWrap: "wrap", maxWidth: 200 }}>
            {item.fx.vocal.map((f) => <FxChip key={f} label={f} />)}
            {item.fx.video.map((f) => <FxChip key={f} label={f} />)}
          </div>
        )}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 18, display: "flex", justifyContent: "center", zIndex: 1 }}>
          <Waveform bars={30} height={44} color="#0D0B14" opacity={0.45} />
        </div>
      </GelCard>

      <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <p style={{ margin: 0, fontFamily: "Inter", fontWeight: 700, fontSize: 15, color: "#F3EFEA" }}>
                {item.artist} <span style={{ color: "#948FA3", fontWeight: 400 }}>{item.handle}</span>
              </p>
              {item.hosts?.length > 0 && <HostStack names={item.hosts} size={17} />}
            </div>
            {item.hosts?.length > 0 && (
              <p style={{ margin: "2px 0 0", fontFamily: "Inter", fontSize: 11, color: "#948FA3" }}>
                with {item.hosts.join(", ")}
              </p>
            )}
            <p style={{ margin: "3px 0 0", fontFamily: "Inter", fontSize: 12.5, color: "#C9C4D6" }}>{item.title}</p>
          </div>
          <button
            onClick={() => setFollowing((f) => !f)}
            style={{
              display: "flex", alignItems: "center", gap: 5, padding: "7px 13px", borderRadius: 999, border: "none", cursor: "pointer",
              fontFamily: "Inter", fontSize: 12.5, fontWeight: 600,
              background: following ? "rgba(255,255,255,0.1)" : `linear-gradient(135deg, ${GELS.amber}, ${GELS.pink})`,
              color: following ? "#F3EFEA" : "#0D0B14",
            }}
          >
            {following ? <Check size={13} /> : <UserPlus size={13} />}
            {following ? "Following" : "Follow"}
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 8 }}>
          <Users size={12} color="#948FA3" />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#948FA3" }}>{fmtNum(item.viewers)} watching</span>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "12px 16px" }} className="no-scrollbar">
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 10, fontFamily: "Inter", fontSize: 13 }}>
            <span style={{ color: GELS.blue, fontWeight: 600 }}>{m.user} </span>
            <span style={{ color: "#E7E3EE" }}>{m.text}</span>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div style={{ display: "flex", gap: 8, padding: "10px 14px calc(10px + env(safe-area-inset-bottom))", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Say something..."
          style={{ flex: 1, background: "#201C2C", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 999, padding: "9px 14px", color: "#F3EFEA", fontFamily: "Inter", fontSize: 13, outline: "none" }}
        />
        <button onClick={send} style={{ width: 38, height: 38, borderRadius: 999, border: "none", background: GELS.violet, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
          <Send size={16} color="#0D0B14" />
        </button>
      </div>
    </div>
  );
}

function ProfileScreen() {
  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflowY: "auto" }} className="no-scrollbar">
      <TopBar title="PROFILE" onSearch={() => {}} />
      <div style={{ padding: "0 20px 10px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <GelCard g={GRADIENTS[4]} style={{ width: 78, height: 78, borderRadius: 999 }} />
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, letterSpacing: 0.5, color: "#F3EFEA", margin: "12px 0 0" }}>Glass Feather</h2>
        <p style={{ fontFamily: "Inter", fontSize: 12.5, color: "#948FA3", margin: "2px 0 10px" }}>@glassfeather · Synthwave from a spare bedroom in Katy, TX</p>
        <div style={{ display: "flex", gap: 22, marginBottom: 16 }}>
          {[["Clips", "38"], ["Followers", "12.4k"], ["Following", "204"]].map(([label, val]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <p style={{ margin: 0, fontFamily: "Inter", fontWeight: 700, fontSize: 15, color: "#F3EFEA" }}>{val}</p>
              <p style={{ margin: 0, fontFamily: "Inter", fontSize: 10.5, color: "#948FA3" }}>{label}</p>
            </div>
          ))}
        </div>
        <button style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "transparent", color: "#F3EFEA", fontFamily: "Inter", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
          Edit profile
        </button>
      </div>
      <div style={{ padding: "6px 16px 0" }}>
        <p style={sectionLabel}>UPLOADED CLIPS</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, padding: "0 16px 24px" }}>
        {[...GRADIENTS, ...GRADIENTS].slice(0, 9).map((g, i) => (
          <GelCard key={i} g={g} style={{ borderRadius: 8, aspectRatio: "0.72" }}>
            <div style={{ position: "absolute", bottom: 5, left: 5, display: "flex", alignItems: "center", gap: 3, zIndex: 1 }}>
              <Music2 size={10} color="#0D0B14" />
            </div>
          </GelCard>
        ))}
      </div>
    </div>
  );
}

const uploadOptionStyle = (color) => ({
  display: "flex", alignItems: "center", gap: 10, padding: "13px 16px", borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.08)", background: "#201C2C", color: "#F3EFEA",
  fontFamily: "Inter", fontWeight: 600, fontSize: 13.5, cursor: "pointer", textAlign: "left",
});

function UploadModal({ onClose, onGoLive }) {
  const [step, setStep] = useState("pick");
  return (
    <div style={{ position: "absolute", inset: 0, background: "rgba(13,11,20,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "flex-end", zIndex: 10 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", background: "#17141F", borderRadius: "20px 20px 0 0", padding: "18px 20px calc(22px + env(safe-area-inset-bottom))", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 0.5, color: "#F3EFEA" }}>
            {step === "pick" ? "SHARE SOMETHING" : "READY TO POST"}
          </span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X size={19} color="#948FA3" />
          </button>
        </div>
        {step === "pick" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button onClick={() => setStep("ready")} style={uploadOptionStyle(GELS.pink)}>
              <Music2 size={17} /> Upload a track clip
            </button>
            <button onClick={onGoLive} style={uploadOptionStyle(GELS.violet)}>
              <Radio size={17} /> Go live (solo or with collaborators)
            </button>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <Waveform bars={26} height={30} color={GELS.amber} opacity={0.9} />
            <p style={{ fontFamily: "Inter", fontSize: 12.5, color: "#948FA3", margin: "14px 0 16px" }}>
              This is a prototype — posting isn't wired up yet, but here's where your clip would go out to Setlist.
            </p>
            <button
              onClick={onClose}
              style={{ width: "100%", padding: 12, borderRadius: 999, border: "none", background: `linear-gradient(135deg, ${GELS.amber}, ${GELS.pink})`, color: "#0D0B14", fontFamily: "Inter", fontWeight: 700, fontSize: 13.5, cursor: "pointer" }}
            >
              Got it
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Comments panel ---------- */
function CommentsPanel({ clip, comments, onPost, onClose }) {
  const [draft, setDraft] = useState("");
  const all = [...COMMENT_TEMPLATES, ...comments];
  const send = () => {
    if (!draft.trim()) return;
    onPost(draft.trim());
    setDraft("");
  };
  return (
    <div style={{ position: "absolute", inset: 0, background: "rgba(13,11,20,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "flex-end", zIndex: 10 }} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", height: "68%", background: "#17141F", borderRadius: "20px 20px 0 0", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 18px 10px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 19, letterSpacing: 0.5, color: "#F3EFEA" }}>
            {fmtNum(clip.comments + comments.length)} COMMENTS
          </span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X size={18} color="#948FA3" />
          </button>
        </div>

        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "12px 18px" }} className="no-scrollbar">
          {all.map((c, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <div
                style={{
                  width: 28, height: 28, borderRadius: 999, flexShrink: 0,
                  background: `linear-gradient(135deg, ${GRADIENTS[i % GRADIENTS.length][0]}, ${GRADIENTS[i % GRADIENTS.length][1]})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "Inter", fontWeight: 700, fontSize: 11, color: "#0D0B14",
                }}
              >
                {c.user[0].toUpperCase()}
              </div>
              <div>
                <p style={{ margin: 0, fontFamily: "Inter", fontSize: 12.5, fontWeight: 600, color: "#F3EFEA" }}>{c.user}</p>
                <p style={{ margin: "2px 0 0", fontFamily: "Inter", fontSize: 13, color: "#C9C4D6", lineHeight: 1.4 }}>{c.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, padding: "10px 14px calc(10px + env(safe-area-inset-bottom))", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={`Comment on "${clip.title}"`}
            style={{ flex: 1, background: "#201C2C", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 999, padding: "9px 14px", color: "#F3EFEA", fontFamily: "Inter", fontSize: 13, outline: "none" }}
          />
          <button onClick={send} style={{ width: 38, height: 38, borderRadius: 999, border: "none", background: GELS.violet, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <Send size={16} color="#0D0B14" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Duet / remix ---------- */
function RemixModal({ clip, onClose }) {
  const [step, setStep] = useState("setup"); // setup | recording | preview | posted
  const [seconds, setSeconds] = useState(0);
  const takeGradient = [GELS.violet, GELS.blue];

  useEffect(() => {
    if (step !== "recording") return;
    setSeconds(0);
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [step]);

  return (
    <div style={{ position: "absolute", inset: 0, background: "#0D0B14", zIndex: 20, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <ChevronLeft size={20} color="#F3EFEA" />
        </button>
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 19, letterSpacing: 0.5, color: "#F3EFEA" }}>DUET</span>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", padding: 14, gap: 12 }}>
        <GelCard g={clip.g} style={{ flex: 1, borderRadius: 16, padding: 14, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <span style={{ position: "absolute", top: 12, left: 12, zIndex: 1, ...miniTagStyle }}>ORIGINAL</span>
          <div style={{ position: "relative", zIndex: 1 }}>
            <Waveform bars={22} height={26} color="#0D0B14" opacity={0.5} />
            <p style={{ margin: "8px 0 0", fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: "#0D0B14" }}>{clip.title}</p>
            <p style={{ margin: "2px 0 0", fontFamily: "Inter", fontSize: 12, fontWeight: 600, color: "rgba(13,11,20,0.75)" }}>{clip.artist}</p>
          </div>
        </GelCard>

        {step === "setup" && (
          <button
            onClick={() => setStep("recording")}
            style={{
              flex: 1, borderRadius: 16, border: "2px dashed rgba(255,255,255,0.18)", background: "#17141F",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer",
            }}
          >
            <div style={{ width: 52, height: 52, borderRadius: 999, background: `linear-gradient(135deg, ${GELS.violet}, ${GELS.blue})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Mic size={22} color="#0D0B14" />
            </div>
            <span style={{ fontFamily: "Inter", fontSize: 13, fontWeight: 600, color: "#F3EFEA" }}>Tap to record your take</span>
            <span style={{ fontFamily: "Inter", fontSize: 11.5, color: "#948FA3" }}>Sing, play, or freestyle over it</span>
          </button>
        )}

        {step === "recording" && (
          <GelCard g={takeGradient} style={{ flex: 1, borderRadius: 16, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <span style={{ position: "absolute", top: 12, left: 12, zIndex: 1, ...miniTagStyle }}>YOUR TAKE</span>
            <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <Waveform bars={24} height={30} color="#0D0B14" opacity={0.6} />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#0D0B14", fontWeight: 600 }}>
                REC {fmtTime(seconds)}
              </span>
              <button
                onClick={() => setStep("preview")}
                style={{ width: 46, height: 46, borderRadius: 999, border: "none", background: "#0D0B14", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              >
                <Square size={16} color="#FF3B3B" fill="#FF3B3B" />
              </button>
            </div>
          </GelCard>
        )}

        {step === "preview" && (
          <GelCard g={takeGradient} style={{ flex: 1, borderRadius: 16, padding: 14, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <span style={{ position: "absolute", top: 12, left: 12, zIndex: 1, ...miniTagStyle }}>YOUR TAKE · {fmtTime(seconds)}</span>
            <div style={{ position: "relative", zIndex: 1 }}>
              <Waveform bars={22} height={26} color="#0D0B14" opacity={0.6} />
              <p style={{ margin: "8px 0 0", fontFamily: "Inter", fontSize: 12.5, color: "rgba(13,11,20,0.8)" }}>Recorded take ready to pair with the original.</p>
            </div>
          </GelCard>
        )}

        {step === "posted" && (
          <div style={{ flex: 1, borderRadius: 16, background: "#17141F", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 20, textAlign: "center" }}>
            <Waveform bars={22} height={26} color={GELS.amber} opacity={0.9} />
            <p style={{ fontFamily: "Inter", fontSize: 13, color: "#F3EFEA", fontWeight: 600, margin: 0 }}>Your duet is queued to post</p>
            <p style={{ fontFamily: "Inter", fontSize: 12, color: "#948FA3", margin: 0 }}>
              {clip.artist} will get notified once it's live.
            </p>
          </div>
        )}
      </div>

      <div style={{ padding: "10px 16px calc(14px + env(safe-area-inset-bottom))", flexShrink: 0 }}>
        {step === "preview" && (
          <button onClick={() => setStep("posted")} style={primaryBtnStyle}>
            Post duet
          </button>
        )}
        {step === "posted" && (
          <button onClick={onClose} style={primaryBtnStyle}>
            Done
          </button>
        )}
        {(step === "setup" || step === "recording") && (
          <p style={{ textAlign: "center", fontFamily: "Inter", fontSize: 11.5, color: "#948FA3", margin: 0 }}>
            {step === "setup" ? "Your recording will play alongside the original." : "Recording your take..."}
          </p>
        )}
      </div>
    </div>
  );
}

const miniTagStyle = { fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: "rgba(13,11,20,0.7)", background: "rgba(255,255,255,0.35)", padding: "2px 6px", borderRadius: 4, letterSpacing: 0.5 };
const primaryBtnStyle = { width: "100%", padding: 13, borderRadius: 999, border: "none", background: `linear-gradient(135deg, ${GELS.amber}, ${GELS.pink})`, color: "#0D0B14", fontFamily: "Inter", fontWeight: 700, fontSize: 13.5, cursor: "pointer" };

/* ---------- Search / discover ---------- */
function ResultCard({ item, onTap }) {
  return (
    <button onClick={() => onTap(item)} style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}>
      <GelCard g={item.g} style={{ borderRadius: 12, height: 92, padding: 8, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ display: "flex", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
          {item.kind === "live" ? <LiveBadge small /> : <span />}
          {item.kind === "live" && (
            <span style={{ display: "flex", alignItems: "center", gap: 3, background: "rgba(0,0,0,0.32)", color: "#fff", fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, padding: "2px 5px", borderRadius: 4 }}>
              <Users size={9} /> {fmtNum(item.viewers)}
            </span>
          )}
        </div>
        <Waveform bars={12} height={14} color="#0D0B14" opacity={0.4} />
      </GelCard>
      <p style={{ margin: "6px 0 0", fontFamily: "Inter", fontSize: 12, fontWeight: 600, color: "#F3EFEA", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {item.title}
      </p>
      <p style={{ margin: "1px 0 0", fontFamily: "Inter", fontSize: 10.5, color: "#948FA3" }}>{item.artist}</p>
    </button>
  );
}

function DiscoverScreen({ onClose, onOpenLive }) {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("All");
  const combined = [...CLIPS.map((c) => ({ ...c, kind: "clip" })), ...LIVES.map((l) => ({ ...l, kind: "live" }))];
  const q = query.trim().toLowerCase();
  const filtered = combined.filter((item) => {
    const matchesGenre = genre === "All" || item.genre === genre;
    const matchesQuery = !q || item.artist.toLowerCase().includes(q) || item.title.toLowerCase().includes(q) || item.handle.toLowerCase().includes(q);
    return matchesGenre && matchesQuery;
  });

  const handleTap = (item) => {
    if (item.kind === "live") onOpenLive(item);
    else onClose();
  };

  return (
    <div style={{ position: "absolute", inset: 0, background: "#0D0B14", zIndex: 20, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px 10px", flexShrink: 0 }}>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <ChevronLeft size={20} color="#F3EFEA" />
        </button>
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search artists, tracks, genres"
          style={{ flex: 1, background: "#201C2C", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 999, padding: "9px 14px", color: "#F3EFEA", fontFamily: "Inter", fontSize: 13, outline: "none" }}
        />
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }} className="no-scrollbar">
        {!q && (
          <>
            <div style={{ padding: "4px 16px 4px", display: "flex", alignItems: "center", gap: 6 }}>
              <TrendingUp size={12} color="#948FA3" />
              <p style={{ ...sectionLabel, margin: 0 }}>TRENDING ARTISTS</p>
            </div>
            <div style={{ display: "flex", gap: 14, overflowX: "auto", padding: "8px 16px 16px" }} className="no-scrollbar">
              {ARTISTS.map((a) => (
                <div key={a.handle} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, width: 62, flexShrink: 0 }}>
                  <GelCard g={a.g} style={{ width: 50, height: 50, borderRadius: 999 }} />
                  <span style={{ fontFamily: "Inter", fontSize: 10, color: "#C9C4D6", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 60 }}>
                    {a.handle}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "0 16px 14px" }} className="no-scrollbar">
          {GENRE_CHIPS.map((g) => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              style={{
                flexShrink: 0, padding: "6px 13px", borderRadius: 999, fontSize: 12, fontFamily: "Inter", fontWeight: 500,
                border: "1px solid " + (genre === g ? "transparent" : "rgba(255,255,255,0.12)"),
                background: genre === g ? GELS.violet : "transparent",
                color: genre === g ? "#0D0B14" : "#C9C4D6", cursor: "pointer",
              }}
            >
              {g}
            </button>
          ))}
        </div>

        <div style={{ padding: "0 16px 4px" }}>
          <p style={sectionLabel}>{q ? `RESULTS FOR "${query}"` : "TRENDING NOW"}</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10, padding: "0 16px 24px" }}>
          {filtered.length ? (
            filtered.map((item) => <ResultCard key={`${item.kind}-${item.id}`} item={item} onTap={handleTap} />)
          ) : (
            <p style={{ gridColumn: "1 / -1", fontFamily: "Inter", fontSize: 12.5, color: "#948FA3", textAlign: "center", padding: "20px 0" }}>
              Nothing matches yet — try a different search.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Go live together (multi-host broadcast) ---------- */
function toggleChipStyle(active, color) {
  return {
    flexShrink: 0, padding: "7px 12px", borderRadius: 999, fontSize: 12, fontFamily: "Inter", fontWeight: 500,
    border: "1px solid " + (active ? "transparent" : "rgba(255,255,255,0.12)"),
    background: active ? color : "transparent",
    color: active ? "#0D0B14" : "#C9C4D6", cursor: "pointer",
  };
}

function GoLiveSetup({ title, setTitle, invited, toggleInvite, onStart, onClose }) {
  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", flexShrink: 0 }}>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <ChevronLeft size={20} color="#F3EFEA" />
        </button>
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 19, letterSpacing: 0.5, color: "#F3EFEA" }}>SET UP YOUR STREAM</span>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "4px 16px 16px" }} className="no-scrollbar">
        <p style={sectionLabel}>STREAM TITLE</p>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: "100%", background: "#201C2C", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 14px", color: "#F3EFEA", fontFamily: "Inter", fontSize: 13.5, outline: "none", marginBottom: 18 }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <Users size={12} color="#948FA3" />
          <p style={{ ...sectionLabel, margin: 0 }}>INVITE CO-HOSTS</p>
        </div>
        <p style={{ fontFamily: "Inter", fontSize: 11.5, color: "#948FA3", margin: "4px 0 12px" }}>
          Go live together — invited artists share the stage, chat, and effects.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {ARTISTS.map((a) => {
            const active = invited.includes(a.artist);
            return (
              <button
                key={a.handle}
                onClick={() => toggleInvite(a.artist)}
                style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 12, cursor: "pointer",
                  border: "1px solid " + (active ? "transparent" : "rgba(255,255,255,0.08)"),
                  background: active ? "rgba(124,92,255,0.16)" : "#17141F",
                }}
              >
                <GelCard g={a.g} style={{ width: 32, height: 32, borderRadius: 999, flexShrink: 0 }} />
                <span style={{ flex: 1, textAlign: "left", fontFamily: "Inter", fontSize: 13, fontWeight: 600, color: "#F3EFEA" }}>{a.artist}</span>
                <div style={{ width: 20, height: 20, borderRadius: 999, border: active ? "none" : "1.5px solid rgba(255,255,255,0.25)", background: active ? GELS.violet : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {active && <Check size={12} color="#0D0B14" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: "10px 16px calc(14px + env(safe-area-inset-bottom))", flexShrink: 0 }}>
        <button onClick={onStart} style={primaryBtnStyle}>
          {invited.length ? `Go live with ${invited.length} co-host${invited.length > 1 ? "s" : ""}` : "Go live solo"}
        </button>
      </div>
    </div>
  );
}

function ProjectPanel({ layers, addLayer }) {
  return (
    <div style={{ padding: "12px 16px" }}>
      <div style={{ background: "#17141F", borderRadius: 12, padding: 14, marginBottom: 14, border: "1px solid rgba(255,255,255,0.06)" }}>
        <p style={{ margin: 0, fontFamily: "'Bebas Neue', sans-serif", fontSize: 17, letterSpacing: 0.5, color: "#F3EFEA" }}>Untitled Session</p>
        <p style={{ margin: "3px 0 0", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#948FA3" }}>118 BPM · A minor</p>
      </div>

      <p style={sectionLabel}>LAYERS ({layers.length})</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {layers.map((l, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, background: "#17141F", border: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: GRADIENTS[i % GRADIENTS.length][0], flexShrink: 0 }} />
            <span style={{ flex: 1, fontFamily: "Inter", fontSize: 13, fontWeight: 600, color: "#F3EFEA" }}>{l.type}</span>
            <span style={{ fontFamily: "Inter", fontSize: 11, color: "#948FA3" }}>{l.host}</span>
          </div>
        ))}
      </div>

      <p style={sectionLabel}>ADD LAYER</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {LAYER_TYPES.map((t) => (
          <button key={t} onClick={() => addLayer(t)} style={toggleChipStyle(false, GELS.violet)}>
            + {t}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- Real camera/mic + live audio FX (Web Audio API) ---------- */
function makeImpulse(ctx, duration = 2.2, decay = 2.8) {
  const rate = ctx.sampleRate;
  const length = Math.floor(rate * duration);
  const impulse = ctx.createBuffer(2, length, rate);
  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  return impulse;
}
function applyReverb(ctx, input, created) {
  const convolver = ctx.createConvolver();
  convolver.buffer = makeImpulse(ctx);
  const wet = ctx.createGain(); wet.gain.value = 0.5;
  const dry = ctx.createGain(); dry.gain.value = 0.7;
  const sum = ctx.createGain();
  input.connect(convolver); convolver.connect(wet); wet.connect(sum);
  input.connect(dry); dry.connect(sum);
  created.push(convolver, wet, dry, sum);
  return sum;
}
function applyEcho(ctx, input, created) {
  const delay = ctx.createDelay(1.2); delay.delayTime.value = 0.28;
  const feedback = ctx.createGain(); feedback.gain.value = 0.35;
  const wet = ctx.createGain(); wet.gain.value = 0.6;
  const dry = ctx.createGain(); dry.gain.value = 0.8;
  const sum = ctx.createGain();
  input.connect(delay); delay.connect(feedback); feedback.connect(delay); delay.connect(wet); wet.connect(sum);
  input.connect(dry); dry.connect(sum);
  created.push(delay, feedback, wet, dry, sum);
  return sum;
}
function applyChorus(ctx, input, created) {
  const sum = ctx.createGain();
  const dry = ctx.createGain(); dry.gain.value = 0.8;
  input.connect(dry); dry.connect(sum);
  created.push(dry, sum);
  [0.018, 0.027].forEach((base, i) => {
    const delay = ctx.createDelay(0.05); delay.delayTime.value = base;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.6 + i * 0.3;
    const lfoGain = ctx.createGain(); lfoGain.gain.value = 0.004;
    lfo.connect(lfoGain); lfoGain.connect(delay.delayTime); lfo.start();
    const wet = ctx.createGain(); wet.gain.value = 0.35;
    input.connect(delay); delay.connect(wet); wet.connect(sum);
    created.push(delay, lfo, lfoGain, wet);
  });
  return sum;
}
function applyRingMod(ctx, input, created, freq) {
  const ring = ctx.createGain(); ring.gain.value = 0;
  const osc = ctx.createOscillator(); osc.frequency.value = freq; osc.type = "sine";
  osc.connect(ring.gain); osc.start();
  input.connect(ring);
  created.push(ring, osc);
  return ring;
}

function useLiveMedia() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const chainRef = useRef([]);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play?.().catch(() => {}); }
        const Ctx = window.AudioContext || window.webkitAudioContext;
        const ctx = new Ctx();
        audioCtxRef.current = ctx;
        ctx.resume?.().catch(() => {});
        const source = ctx.createMediaStreamSource(stream);
        sourceRef.current = source;
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 128;
        analyserRef.current = analyser;
        source.connect(analyser);
        setReady(true);
      } catch (err) {
        setError(err?.message || "Camera/mic access was denied");
      }
    })();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      chainRef.current.forEach((n) => { try { n.disconnect(); } catch {} });
      try { sourceRef.current?.disconnect(); } catch {}
      audioCtxRef.current?.close?.().catch(() => {});
    };
  }, []);

  const rebuildChain = (vocalFx, monitor) => {
    const ctx = audioCtxRef.current;
    const source = sourceRef.current;
    if (!ctx || !source) return;
    chainRef.current.forEach((n) => { try { n.disconnect(); } catch {} });
    chainRef.current = [];
    try { source.disconnect(); } catch {}
    source.connect(analyserRef.current);
    if (!monitor) return;
    const created = [];
    let node = source;
    if (vocalFx.includes("Reverb")) node = applyReverb(ctx, node, created);
    if (vocalFx.includes("Echo")) node = applyEcho(ctx, node, created);
    if (vocalFx.includes("Chorus")) node = applyChorus(ctx, node, created);
    if (vocalFx.includes("Robot")) node = applyRingMod(ctx, node, created, 45);
    if (vocalFx.includes("Autotune")) node = applyRingMod(ctx, node, created, 220);
    const out = ctx.createGain(); out.gain.value = 0.9;
    node.connect(out); out.connect(ctx.destination);
    created.push(out);
    chainRef.current = created;
  };

  const toggleMic = () => {
    const track = streamRef.current?.getAudioTracks?.()[0];
    if (track) { track.enabled = !track.enabled; setMicOn(track.enabled); }
  };
  const toggleCam = () => {
    const track = streamRef.current?.getVideoTracks?.()[0];
    if (track) { track.enabled = !track.enabled; setCamOn(track.enabled); }
  };

  return { videoRef, analyser: analyserRef.current, error, ready, micOn, camOn, toggleMic, toggleCam, rebuildChain };
}

function MicWaveform({ analyser, bars = 22, height = 26, color = "#0D0B14" }) {
  const barRefs = useRef([]);
  useEffect(() => {
    if (!analyser) return;
    let raf;
    const data = new Uint8Array(analyser.frequencyBinCount);
    const draw = () => {
      analyser.getByteFrequencyData(data);
      const step = Math.max(1, Math.floor(data.length / bars));
      for (let i = 0; i < bars; i++) {
        const v = data[i * step] / 255;
        const el = barRefs.current[i];
        if (el) el.style.height = `${Math.max(10, v * 100)}%`;
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [analyser, bars]);

  return (
    <div style={{ display: "flex", alignItems: "flex-end", height, gap: 3 }}>
      {Array.from({ length: bars }).map((_, i) => (
        <div key={i} ref={(el) => (barRefs.current[i] = el)} style={{ width: 3, borderRadius: 2, background: color, opacity: 0.9, height: "10%", transition: "height 0.05s linear" }} />
      ))}
    </div>
  );
}

function BroadcasterScreen({ title, hosts, onEnd }) {
  const [tab, setTab] = useState("chat");
  const [messages, setMessages] = useState(CHAT_SEED.slice(0, 3));
  const [draft, setDraft] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [viewers, setViewers] = useState(38);
  const [vocalFx, setVocalFx] = useState([]);
  const [videoFx, setVideoFx] = useState([]);
  const [monitor, setMonitor] = useState(false);
  const [layers, setLayers] = useState([{ type: "Vocals", host: "you" }]);
  const chatEndRef = useRef(null);
  const media = useLiveMedia();

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const t = setInterval(() => setViewers((v) => v + Math.floor(Math.random() * 4)), 3500);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  useEffect(() => {
    if (media.ready) media.rebuildChain(vocalFx, monitor);
  }, [media.ready, vocalFx, monitor]);

  const toggleFx = (list, setList, fx) => setList(list.includes(fx) ? list.filter((f) => f !== fx) : [...list, fx]);
  const send = () => {
    if (!draft.trim()) return;
    setMessages((m) => [...m, { user: "you", text: draft.trim() }]);
    setDraft("");
  };
  const addLayer = (type) => setLayers((l) => [...l, { type, host: hosts.length ? hosts[l.length % hosts.length] || "you" : "you" }]);

  const videoStyle = combineVideoFx(videoFx);

  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", flexShrink: 0 }}>
        <button onClick={onEnd} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer" }}>
          <ChevronLeft size={19} color="#F3EFEA" />
          <span style={{ fontFamily: "Inter", fontSize: 12, color: "#F3EFEA", fontWeight: 600 }}>End</span>
        </button>
        <LiveBadge />
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#948FA3" }}>{fmtTime(seconds)}</span>
      </div>

      <div style={{ padding: "0 14px 10px", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {/* Real camera tile — this is you */}
          <div style={{ ...videoStyle, position: "relative", flex: 1.3, height: 118, borderRadius: 12, overflow: "hidden", background: "#17141F", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            {media.error ? (
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, padding: 8, textAlign: "center" }}>
                <MicOff size={16} color="#948FA3" />
                <span style={{ fontFamily: "Inter", fontSize: 9.5, color: "#948FA3" }}>Camera/mic blocked — check browser permissions</span>
              </div>
            ) : (
              <>
                <video ref={media.videoRef} muted playsInline autoPlay style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)", opacity: media.camOn ? 1 : 0 }} />
                {!media.camOn && (
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#17141F" }}>
                    <Video size={18} color="#4b4658" />
                  </div>
                )}
                <div style={{ position: "absolute", top: 6, left: 6, zIndex: 1, display: "flex", gap: 4 }}>
                  <button onClick={media.toggleMic} style={{ width: 22, height: 22, borderRadius: 999, border: "none", background: media.micOn ? "rgba(0,0,0,0.4)" : "#FF3B3B", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    {media.micOn ? <Mic size={11} color="#fff" /> : <MicOff size={11} color="#fff" />}
                  </button>
                  <button onClick={media.toggleCam} style={{ width: 22, height: 22, borderRadius: 999, border: "none", background: media.camOn ? "rgba(0,0,0,0.4)" : "#FF3B3B", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <Video size={11} color="#fff" />
                  </button>
                </div>
                <div style={{ position: "relative", zIndex: 1, padding: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "Inter", fontSize: 11, fontWeight: 700, color: "#fff", textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}>You</span>
                  <MicWaveform analyser={media.analyser} bars={12} height={16} color="#fff" />
                </div>
              </>
            )}
          </div>

          {hosts.map((h, i) => (
            <GelCard key={h} g={GRADIENTS[(i + 1) % GRADIENTS.length]} style={{ flex: 1, height: 118, borderRadius: 12, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 4, opacity: 0.65 }}>
              <span style={{ position: "relative", zIndex: 1, fontFamily: "Inter", fontSize: 10.5, fontWeight: 700, color: "#0D0B14", textAlign: "center", padding: "0 6px" }}>{h}</span>
              <span style={{ position: "relative", zIndex: 1, fontFamily: "'JetBrains Mono', monospace", fontSize: 8.5, color: "rgba(13,11,20,0.7)" }}>invited · not connected</span>
            </GelCard>
          ))}
        </div>
        <p style={{ margin: "8px 0 0", fontFamily: "Inter", fontSize: 12, color: "#F3EFEA", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
          <Users size={11} color="#948FA3" />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: "#948FA3" }}>{fmtNum(viewers)} watching (simulated)</span>
          {(vocalFx.length > 0 || videoFx.length > 0) && (
            <span style={{ display: "flex", gap: 4, marginLeft: 4 }}>
              {[...vocalFx, ...videoFx].slice(0, 2).map((f) => <FxChip key={f} label={f} small />)}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, padding: "0 14px 10px", flexShrink: 0 }}>
        {[
          { key: "chat", label: "Chat", icon: MessageCircle },
          { key: "fx", label: "FX", icon: Sliders },
          { key: "project", label: "Project", icon: Layers },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "8px 0", borderRadius: 10, cursor: "pointer",
              border: "1px solid " + (tab === key ? "transparent" : "rgba(255,255,255,0.1)"),
              background: tab === key ? GELS.violet : "transparent",
              color: tab === key ? "#0D0B14" : "#C9C4D6", fontFamily: "Inter", fontWeight: 600, fontSize: 12,
            }}
          >
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }} className="no-scrollbar">
        {tab === "chat" && (
          <div style={{ padding: "4px 16px" }}>
            {messages.map((m, i) => (
              <div key={i} style={{ marginBottom: 10, fontFamily: "Inter", fontSize: 13 }}>
                <span style={{ color: GELS.blue, fontWeight: 600 }}>{m.user} </span>
                <span style={{ color: "#E7E3EE" }}>{m.text}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        )}

        {tab === "fx" && (
          <div style={{ padding: "8px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, padding: "10px 12px", borderRadius: 10, background: "#17141F", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div>
                <p style={{ margin: 0, fontFamily: "Inter", fontSize: 12.5, fontWeight: 600, color: "#F3EFEA" }}>Monitor audio</p>
                <p style={{ margin: "2px 0 0", fontFamily: "Inter", fontSize: 10.5, color: "#948FA3" }}>Hear your FX live — use headphones to avoid feedback</p>
              </div>
              <button
                onClick={() => setMonitor((m) => !m)}
                style={{ width: 40, height: 24, borderRadius: 999, border: "none", cursor: "pointer", background: monitor ? GELS.violet : "rgba(255,255,255,0.15)", position: "relative", flexShrink: 0 }}
              >
                <span style={{ position: "absolute", top: 3, left: monitor ? 19 : 3, width: 18, height: 18, borderRadius: 999, background: "#fff", transition: "left 0.15s ease" }} />
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <Mic size={12} color="#948FA3" />
              <p style={{ ...sectionLabel, margin: 0 }}>VOCAL FX — real, processes your mic</p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
              {VOCAL_FX.map((fx) => (
                <button key={fx} onClick={() => toggleFx(vocalFx, setVocalFx, fx)} style={toggleChipStyle(vocalFx.includes(fx), GELS.pink)}>
                  {fx}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <Video size={12} color="#948FA3" />
              <p style={{ ...sectionLabel, margin: 0 }}>VIDEO FX — real, filters your camera</p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {VIDEO_FX.map((fx) => (
                <button key={fx} onClick={() => toggleFx(videoFx, setVideoFx, fx)} style={toggleChipStyle(videoFx.includes(fx), GELS.amber)}>
                  {fx}
                </button>
              ))}
            </div>
            <p style={{ fontFamily: "Inter", fontSize: 11.5, color: "#948FA3", margin: "16px 0 0" }}>
              Video FX apply to your camera instantly. Vocal FX process your real mic audio — toggle "Monitor audio" on (with headphones) to hear them live.
            </p>
          </div>
        )}

        {tab === "project" && <ProjectPanel layers={layers} addLayer={addLayer} />}
      </div>

      {tab === "chat" && (
        <div style={{ display: "flex", gap: 8, padding: "10px 14px calc(10px + env(safe-area-inset-bottom))", borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Say something..."
            style={{ flex: 1, background: "#201C2C", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 999, padding: "9px 14px", color: "#F3EFEA", fontFamily: "Inter", fontSize: 13, outline: "none" }}
          />
          <button onClick={send} style={{ width: 38, height: 38, borderRadius: 999, border: "none", background: GELS.violet, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <Send size={16} color="#0D0B14" />
          </button>
        </div>
      )}
    </div>
  );
}

function GoLiveFlow({ onClose }) {
  const [step, setStep] = useState("setup");
  const [title, setTitle] = useState("writing something new, come hang");
  const [invited, setInvited] = useState([]);

  const toggleInvite = (artist) => setInvited((l) => (l.includes(artist) ? l.filter((a) => a !== artist) : [...l, artist]));

  return (
    <div style={{ position: "absolute", inset: 0, background: "#0D0B14", zIndex: 20, display: "flex", flexDirection: "column" }}>
      {step === "setup" ? (
        <GoLiveSetup title={title} setTitle={setTitle} invited={invited} toggleInvite={toggleInvite} onStart={() => setStep("live")} onClose={onClose} />
      ) : (
        <BroadcasterScreen title={title} hosts={invited} onEnd={onClose} />
      )}
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("feed");
  const [liveItem, setLiveItem] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [liked, setLiked] = useState({});
  const [commentClip, setCommentClip] = useState(null);
  const [remixClip, setRemixClip] = useState(null);
  const [discoverOpen, setDiscoverOpen] = useState(false);
  const [commentsState, setCommentsState] = useState({});
  const [goLiveOpen, setGoLiveOpen] = useState(false);

  const onLike = (id) => setLiked((l) => ({ ...l, [id]: !l[id] }));
  const addComment = (id, text) => setCommentsState((s) => ({ ...s, [id]: [...(s[id] || []), { user: "you", text }] }));
  const handleNav = (key) => {
    setLiveItem(null);
    setScreen(key);
  };
  const openLiveFromDiscover = (item) => {
    setDiscoverOpen(false);
    setScreen("live");
    setLiveItem(item);
  };

  const { width: vw, height: vh } = useViewportSize();
  // Sidebar layout: real desktop windows (wide regardless of aspect),
  // or an iPad-style device turned landscape.
  const isWide = vw >= 1050 || (vw >= 700 && vw > vh);
  const contentMax = vw >= 1200 ? 860 : isWide ? 680 : 560;

  const screens = (
    <>
      {screen === "feed" && (
        <FeedScreen
          liked={liked}
          onLike={onLike}
          onSearch={() => setDiscoverOpen(true)}
          onComment={setCommentClip}
          onRemix={setRemixClip}
          commentsState={commentsState}
        />
      )}
      {screen === "live" && !liveItem && <LiveScreen onOpen={setLiveItem} onSearch={() => setDiscoverOpen(true)} />}
      {screen === "live" && liveItem && <LiveDetailScreen item={liveItem} onBack={() => setLiveItem(null)} />}
      {screen === "profile" && <ProfileScreen />}

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onGoLive={() => {
            setShowUpload(false);
            setGoLiveOpen(true);
          }}
        />
      )}
      {goLiveOpen && <GoLiveFlow onClose={() => setGoLiveOpen(false)} />}
      {commentClip && (
        <CommentsPanel
          clip={commentClip}
          comments={commentsState[commentClip.id] || []}
          onPost={(text) => addComment(commentClip.id, text)}
          onClose={() => setCommentClip(null)}
        />
      )}
      {remixClip && <RemixModal clip={remixClip} onClose={() => setRemixClip(null)} />}
      {discoverOpen && <DiscoverScreen onClose={() => setDiscoverOpen(false)} onOpenLive={openLiveFromDiscover} />}

      {!isWide && <BottomNav screen={screen} setScreen={handleNav} onUpload={() => setShowUpload(true)} />}
    </>
  );

  return (
    <div className="app-root" style={{ width: "100%", height: "100vh", background: "#0D0B14", display: "flex", fontFamily: "Inter", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        html, body { margin: 0; height: 100%; }
        .app-root { height: 100dvh; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes eqBounce { 0%, 100% { transform: scaleY(0.35); } 50% { transform: scaleY(1); } }
        .eq-bar { transform-origin: bottom; animation-name: eqBounce; animation-timing-function: ease-in-out; animation-iteration-count: infinite; }
        @keyframes ringPulse { 0% { box-shadow: 0 0 0 0 rgba(255,59,59,0.55); } 70% { box-shadow: 0 0 0 7px rgba(255,59,59,0); } 100% { box-shadow: 0 0 0 0 rgba(255,59,59,0); } }
        .pulse-ring { animation: ringPulse 1.8s ease-out infinite; }
        .pulse-ring-avatar { animation: ringPulse 1.8s ease-out infinite; }
        @keyframes strobe { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }
        button { -webkit-tap-highlight-color: transparent; transition: filter 0.15s ease, transform 0.15s ease; }
        input:focus { outline: none; box-shadow: 0 0 0 2px ${GELS.violet}55; }
        @media (hover: hover) and (pointer: fine) {
          button:hover { filter: brightness(1.1); }
          button:active { transform: scale(0.97); }
        }
      `}</style>

      {isWide && <SideNav screen={screen} setScreen={handleNav} onUpload={() => setShowUpload(true)} />}

      <div style={{ flex: 1, display: "flex", justifyContent: "center", height: "100%", overflow: "hidden" }}>
        <div
          style={{
            width: "100%",
            maxWidth: contentMax,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            background: "#0D0B14",
            borderLeft: isWide ? "1px solid rgba(255,255,255,0.06)" : "none",
            borderRight: isWide ? "1px solid rgba(255,255,255,0.06)" : "none",
          }}
        >
          {screens}
        </div>
      </div>
    </div>
  );
}

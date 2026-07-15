import { createElement, useEffect, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import {
  ArrowUp,
  CalendarDays,
  Camera,
  CircleUserRound,
  Facebook,
  HeartHandshake,
  Instagram,
  Mail,
  MapPin,
  Menu,
  Moon,
  Palette,
  Phone,
  Play,
  Send,
  Sparkles,
  Sun,
  Twitter,
  Upload,
  X,
  Youtube,
} from "lucide-react";
import { useRef } from "react";
import {
  ARTWORK_UPLOAD_ACCEPT,
  formatFileSize,
  getArtworkUploadError,
} from "../utils/uploadLimits";
import { useNavigate } from "react-router-dom";
import bestArtMonthDummy from "../assets/best-art-month-dummy.png";

const Motion = motion;

const navItems = [
  ["Home", "home"],
  ["About Us", "about"],
  ["Art Categories", "categories"],
  ["Discovery", "artisan-discovery"],
  ["Events & Workshops", "events"],
  ["Gallery", "gallery"],
  ["Contact", "contact"],
];

const categories = [
  ["Painting", "Brush-led traditions, murals, miniatures, and expressive canvas work."],
  ["Sculpture", "Stone, bronze, terracotta, and experimental three-dimensional forms."],
  ["Folk Art", "Living community traditions from Madhubani to Pattachitra."],
  ["Tribal Art", "Indigenous visual languages including Warli, Gond, Bhil, and Sohrai."],
  ["Digital Art", "New media, motion art, illustration, and immersive creative practice."],
  ["Photography", "Documentary, fine-art, cultural, and portrait photography."],
  ["Handicrafts", "Handmade objects, woodwork, pottery, metalwork, and decor."],
  ["Textile Arts", "Weaving, embroidery, dyeing, block printing, and wearable art."],
  ["Contemporary Art", "Bold cross-disciplinary practices from emerging Indian artists."],
];

const events = [
  ["Upcoming Events", "Kala Bazaar: Artist Market", "Delhi", "12 Jun 2026", "Open-air buying fair with live demonstrations."],
  ["Workshops", "Natural Pigment Lab", "Jaipur", "20 Jun 2026", "Hands-on color making with mineral and plant pigments."],
  ["Exhibitions", "Stories in Thread", "Kolkata", "02 Jul 2026", "Textile-led exhibition featuring women artisan collectives."],
  ["Cultural Festivals", "Monsoon Folk Weekend", "Mumbai", "18 Jul 2026", "Performances, talks, pop-up studios, and craft stalls."],
];

const gallery = [
  ["Madhubani pigments", "image"],
  ["Warli workshop", "video"],
  ["Handloom detail", "image"],
  ["Studio portrait", "image"],
  ["Gallery evening", "video"],
  ["Pottery textures", "image"],
];

const faq = {
  "How can I register as an artist?": "Use the Artist Registration form. Add your category, portfolio link, a short bio, and one artwork sample.",
  "How can I support artists?": "You can buy work, sponsor workshops, partner with KalaShaala, or amplify artist profiles through our community channels.",
  "Upcoming events?": "Our next featured event is Kala Bazaar in Delhi on 12 Jun 2026, followed by workshops in Jaipur and Kolkata.",
  "Contact information?": "Email hello@kalashaala.org or call +91 98765 43210. The contact form is near the bottom of this page.",
  "NGO mission?": "KalaShaala promotes Indian artists, preserves cultural art forms, and creates fair visibility and earning opportunities.",
};

const socialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/tisserindia/",
    icon: Instagram,
    tone: "instagram",
  },
  {
    label: "Twitter",
    href: "https://x.com/TisserIndia?s=20",
    icon: Twitter,
    tone: "twitter",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/TisserIndia/",
    icon: Facebook,
    tone: "facebook",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@Tisserindia/",
    icon: Youtube,
    tone: "youtube",
  },
];

function Section({ id, eyebrow, title, children, className = "" }) {
  return (
    <section id={id} className={`section-shell ${className}`}>
      <Motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
        className="section-heading"
      >
        <span>{eyebrow}</span>
        <h2>{title}</h2>
      </Motion.div>
      {children}
    </section>
  );
}

function Counter({ value, label }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let frame;
    const start = performance.now();
    const tick = (time) => {
      const progress = Math.min((time - start) / 1400, 1);
      setCount(Math.floor(value * progress));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value]);

  return (
    <div ref={ref} className="stat-tile">
      <strong>{count.toLocaleString()}+</strong>
      <span>{label}</span>
    </div>
  );
}

function KalaShaalaNGO() {
  const navigate = useNavigate();
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [activeSocial, setActiveSocial] = useState("Instagram");
  const [messages, setMessages] = useState([{ from: "bot", text: "Namaste! I can help you explore KalaShaala, artists, events, and support options." }]);
  const [typing, setTyping] = useState(false);
  const [artistUploadFeedback, setArtistUploadFeedback] = useState(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    const target = window.location.hash.replace("#", "");
    if (!target) return;
    window.setTimeout(() => {
      document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
    }, 80);
  }, []);

  const askBot = (question) => {
    setMessages((items) => [...items, { from: "user", text: question }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((items) => [...items, { from: "bot", text: faq[question] }]);
    }, 650);
  };

  const handleArtistUploadChange = (event) => {
    const file = event.target.files?.[0];
    const error = getArtworkUploadError(file);

    if (error) {
      event.target.value = "";
      setArtistUploadFeedback({ type: "error", text: error });
      return;
    }

    setArtistUploadFeedback(
      file ? { type: "success", text: `${file.name} selected (${formatFileSize(file.size)}).` } : null
    );
  };

  const scrollTo = (id) => {
    if (id === "artisan-discovery") {
      goToPage("/artisan-discovery");
      return;
    }
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = `/#${id}`;
    }
    setMenuOpen(false);
  };

  const goToPage = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  const goToSubscribe = () => {
    goToPage("/subscribe");
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fff8ed] text-[#24150f] transition-colors duration-300 dark:bg-[#100d11] dark:text-[#fff6e6]">
      <div className="loading-strip" />
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/30 bg-white/72 backdrop-blur-2xl dark:border-white/10 dark:bg-[#100d11]/76">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
          <button onClick={() => scrollTo("home")} className="brand-mark" aria-label="KalaShaala home">
            <span>KS</span>
            KalaShaala
          </button>
          <div className="hidden items-center gap-1 lg:flex">
            {navItems.map(([label, id]) => (
              <button className="nav-link" key={id} onClick={() => scrollTo(id)}>{label}</button>
            ))}
          </div>
          <div className="hidden items-center gap-2 lg:flex">
            <button onClick={goToSubscribe} className="pill-button subscribe">Subscribe</button>
            <button onClick={() => goToPage("/register-customer")} className="pill-button soft">Sign up as Customer</button>
            <button onClick={() => goToPage("/register-artist")} className="pill-button warm">Sign up as Artist</button>
            <button onClick={() => goToPage("/login")} className="icon-button" aria-label="Login"><CircleUserRound size={18} /></button>
            <button onClick={() => setDark((value) => !value)} className="icon-button" aria-label="Toggle dark mode">
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
          <div className="flex items-center gap-2 lg:hidden">
            <button onClick={() => setDark((value) => !value)} className="icon-button" aria-label="Toggle dark mode">
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={() => setMenuOpen((value) => !value)} className="icon-button" aria-label="Open menu">
              {menuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </nav>
        <AnimatePresence>
          {menuOpen && (
            <Motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="mobile-menu lg:hidden">
              {navItems.map(([label, id]) => <button key={id} onClick={() => scrollTo(id)}>{label}</button>)}
              <button onClick={goToSubscribe}>Subscribe</button>
              <button onClick={() => goToPage("/register-customer")}>Sign up as Customer</button>
              <button onClick={() => goToPage("/register-artist")}>Sign up as Artist</button>
              <button onClick={() => goToPage("/login")}>Login</button>
            </Motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>
        <section id="home" className="hero-section">
          <div className="hero-grid">
            <Motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="hero-copy">
              <span className="eyebrow"><Sparkles size={16} /> NGO for India's artists</span>
              <h1>Empowering India's Creative Soul</h1>
              <p>Discover talented artists from every corner of India, explore unique art forms, and become part of a community that celebrates creativity.</p>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => goToPage("/explore-artists")} className="cta-primary">Explore Artisan Map</button>
                <button onClick={() => scrollTo("contact")} className="cta-secondary">Contact Now</button>
              </div>
            </Motion.div>
            <Motion.div
              animate={reduceMotion ? {} : { y: [0, -12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="art-showcase"
            >
              <div className="art-showcase-placeholder best-art-card" aria-label="Best Art of the Month">
                <div className="best-art-visual" aria-hidden="true">
                  <img src={bestArtMonthDummy} alt="" />
                  <span className="best-art-sun" />
                  <span className="best-art-arch" />
                  <span className="best-art-motif motif-one" />
                  <span className="best-art-motif motif-two" />
                </div>
                <div className="best-art-copy">
                  <span>Best Art of the Month</span>
                  <strong>Monsoon Courtyard</strong>
                  <p>Blue pottery inspired decor piece by a Jaipur artisan, selected for its calm interior palette and hand-painted floral detailing.</p>
                  <div>
                    <small>Rajasthan / Blue Pottery</small>
                    <small>Featured July 2026</small>
                  </div>
                </div>
              </div>
              <div className="floating-badge top-6 left-4"><Palette size={18} /> Monthly Pick</div>
              <div className="floating-badge bottom-6 right-4"><HeartHandshake size={18} /> Buyer ready</div>
            </Motion.div>
          </div>
        </section>

        <Section id="about" eyebrow="Mission, Vision, Impact" title="A national stage for living art traditions">
          <div className="about-grid">
            <div className="impact-panel">
              <h3>Mission</h3>
              <p>Promote artists across India through discovery, fair opportunities, community-led events, and direct support.</p>
              <h3>Vision</h3>
              <p>A creative economy where traditional and modern Indian artists are seen, respected, and sustainably supported.</p>
            </div>
            <div className="stats-grid">
              <Counter value={4200} label="Registered Artists" />
              <Counter value={28} label="States Covered" />
              <Counter value={186} label="Art Events Conducted" />
              <Counter value={52000} label="Lives Impacted" />
            </div>
          </div>
        </Section>

        <Section id="categories" eyebrow="Art Categories" title="Traditional roots, contemporary energy">
          <div className="category-grid">
            {categories.map(([title, desc]) => (
              <Motion.article whileHover={{ scale: 1.025 }} className="category-card" key={title}>
                <div className="category-card-visual" aria-hidden="true">
                  <Sparkles size={38} />
                </div>
                <div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
              </Motion.article>
            ))}
          </div>
        </Section>

        <section className="section-shell spotlight-band">
          <div>
            <span className="section-kicker">Artist Spotlight</span>
            <h2>From village studio to national buyers</h2>
            <p>Every month KalaShaala highlights one artist with editorial storytelling, buyer outreach, sponsor matching, and workshop support.</p>
          </div>
          <div className="spotlight-visual" aria-label="Artist spotlight media placeholder">
            <HeartHandshake size={42} />
            <strong>Artist media pending</strong>
          </div>
        </section>

        <Section id="artist-register" eyebrow="Artist Registration" title="Join KalaShaala as an artist">
          <form className="form-grid">
            {["Name", "Email", "Phone", "State", "Art Category", "Portfolio Link"].map((label) => <input key={label} placeholder={label} />)}
            <textarea placeholder="Bio" />
            <div className="upload-control">
              <label className="upload-box">
                <Upload size={20} />
                Upload Artwork (max 5 MB)
                <input
                  type="file"
                  accept={ARTWORK_UPLOAD_ACCEPT}
                  onChange={handleArtistUploadChange}
                />
              </label>
              {artistUploadFeedback && (
                <p className={`upload-feedback ${artistUploadFeedback.type === "error" ? "is-error" : ""}`}>
                  {artistUploadFeedback.text}
                </p>
              )}
            </div>
            <button type="button" className="cta-primary">Submit Artist Profile</button>
          </form>
        </Section>

        <Section id="user-register" eyebrow="User Registration" title="Create your KalaShaala community profile">
          <form className="form-grid compact">
            {["Name", "Email", "Mobile Number", "Interests", "Password"].map((label) => <input key={label} placeholder={label} type={label === "Password" ? "password" : "text"} />)}
            <button type="button" className="cta-primary">Register as User</button>
          </form>
        </Section>

        <Section id="events" eyebrow="Events & Workshops" title="Meet artists in the room where culture moves">
          <div className="event-grid">
            {events.map(([type, name, place, date, detail]) => (
              <article className="event-card" key={name}>
                <span><CalendarDays size={16} /> {type}</span>
                <h3>{name}</h3>
                <p>{detail}</p>
                <div>{place} / {date}</div>
                <button onClick={() => goToPage(`/event-registration?event=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}&place=${encodeURIComponent(place)}&date=${encodeURIComponent(date)}`)}>Register Now</button>
              </article>
            ))}
          </div>
        </Section>

        <Section id="gallery" eyebrow="Gallery" title="A living wall of artworks, videos, and artist highlights">
          <div className="masonry-gallery">
            {gallery.map(([title, type], index) => (
              <button className={index % 3 === 0 ? "tall" : ""} key={title} onClick={() => setLightbox({ title, type })}>
                <div className="gallery-tile-visual" aria-hidden="true">
                  {type === "video" ? <Play size={34} /> : <Camera size={34} />}
                </div>
                <span>{type === "video" ? <Play size={18} /> : <Camera size={18} />} {title}</span>
              </button>
            ))}
          </div>
        </Section>

        <Section id="contact" eyebrow="Contact" title="Partner, support, or bring KalaShaala to your city">
          <div className="contact-grid">
            <form className="contact-form">
              <input placeholder="Name" />
              <input placeholder="Email" />
              <textarea placeholder="Message" />
              <div className="flex flex-wrap gap-3">
                <button type="button" className="cta-primary">Contact Now</button>
              </div>
            </form>
            <div className="contact-card">
              <p><Mail size={18} /> contact@tisser.com</p>
              <p><Phone size={18} /> +91 XXXXXXXX</p>
              <p><MapPin size={18} /> Tisser India,Maharashtra,Mumbai</p>
              <div className="social-row">
                {socialLinks.map(({ label, href, icon, tone }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open KalaShaala on ${label}`}
                    className={`social-link social-link-${tone} ${activeSocial === label ? "active" : ""}`}
                    onMouseEnter={() => setActiveSocial(label)}
                    onFocus={() => setActiveSocial(label)}
                    onClick={() => setActiveSocial(label)}
                  >
                    {createElement(icon, { size: 23, strokeWidth: 2.15 })}
                    <span>{label}</span>
                  </a>
                ))}
              </div>
              <form className="newsletter">
                <input placeholder="Newsletter email" aria-label="Newsletter email" />
                <button type="button"><Send size={18} /></button>
              </form>
            </div>
          </div>
        </Section>
      </main>

      <footer>
        <div>
          <h3>KalaShaala</h3>
          <p>(c) 2026 KalaShaala NGO. Empowering Artists Across India.</p>
        </div>
        <div className="footer-links">
          {["Quick Links", "Artist Resources", "Contact Information", "Social Media Icons", "Newsletter Signup"].map((item) => <a key={item} href="#home">{item}</a>)}
        </div>
      </footer>

      <button className="back-top" onClick={() => scrollTo("home")} aria-label="Back to top"><ArrowUp size={20} /></button>

      <div className="chatbot">
        <AnimatePresence>
          {chatOpen && (
            <Motion.div initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.96 }} className="chat-panel">
              <div className="chat-head"><strong>KalaShaala Assist</strong><button onClick={() => setChatOpen(false)} aria-label="Close chatbot"><X size={18} /></button></div>
              <div className="chat-messages">
                {messages.map((message, index) => <p key={`${message.text}-${index}`} className={message.from}>{message.text}</p>)}
                {typing && <p className="bot typing">Typing...</p>}
              </div>
              <div className="quick-replies">
                {Object.keys(faq).map((question) => <button key={question} onClick={() => askBot(question)}>{question}</button>)}
              </div>
            </Motion.div>
          )}
        </AnimatePresence>
        <button onClick={() => setChatOpen((value) => !value)} className="chat-toggle" aria-label="Open chatbot"><Sparkles size={22} /></button>
      </div>

      <AnimatePresence>
        {lightbox && (
          <Motion.div className="lightbox" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLightbox(null)}>
            <button aria-label="Close preview"><X /></button>
            <div className="lightbox-art-placeholder">
              {lightbox.type === "video" ? <Play size={54} /> : <Camera size={54} />}
            </div>
            <p>{lightbox.title}</p>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default KalaShaalaNGO;

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  HeartHandshake,
  Moon,
  Palette,
  Sun,
  Upload,
} from "lucide-react";
import {
  ARTWORK_UPLOAD_ACCEPT,
  formatFileSize,
  getArtworkUploadError,
} from "../utils/uploadLimits";

const pageCopy = {
  customer: {
    eyebrow: "Interior Design Artisan Registration",
    title: "Register for Interior Artisan Work",
    intro: "Create a customer account to discover artisans who make interior decor, wall art, furniture, textiles, and custom handmade pieces for homes and commercial spaces.",
    button: "Create Interior Customer Account",
    fields: ["User Name", "Email", "Password", "Re-enter Password"],
  },
  artist: {
    eyebrow: "Artist Registration",
    title: "Register as Artist",
    intro: "Share your profile, art form, portfolio, and story so KalaShaala can help buyers and supporters discover your work.",
    button: "Submit Artist Profile",
    fields: ["Name", "Email", "Phone", "State", "Art Category", "Portfolio Link"],
  },
};

const customerInterests = [
  "Wall Murals",
  "Decor Paintings",
  "Handmade Furniture",
  "Textile Decor",
  "Ceramic Decor",
  "Lighting Pieces",
  "Sculpture Accents",
  "Custom Room Art",
];

function getFieldType(label) {
  if (label.toLowerCase().includes("password")) {
    return "password";
  }

  if (label.toLowerCase().includes("email")) {
    return "email";
  }

  return "text";
}

function RegisterPage({ type }) {
  const [dark, setDark] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState({});
  const copy = pageCopy[type] || pageCopy.customer;
  const isCustomer = type === "customer";
  const isArtist = type === "artist";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    return () => document.documentElement.classList.remove("dark");
  }, [dark]);

  useEffect(() => {
    setUploadFeedback({});
  }, [type]);

  function handleUploadChange(event, field) {
    const file = event.target.files?.[0];
    const error = getArtworkUploadError(file);

    if (error) {
      event.target.value = "";
      setUploadFeedback((current) => ({ ...current, [field]: { type: "error", text: error } }));
      return;
    }

    setUploadFeedback((current) => ({
      ...current,
      [field]: file
        ? { type: "success", text: `${file.name} selected (${formatFileSize(file.size)}).` }
        : null,
    }));
  }

  return (
    <div className="register-page min-h-screen bg-[#fff8ed] text-[#24150f] transition-colors duration-300 dark:bg-[#100d11] dark:text-[#fff6e6]">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/30 bg-white/72 backdrop-blur-2xl dark:border-white/10 dark:bg-[#100d11]/76">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
          <Link to="/" className="brand-mark" aria-label="Back to KalaShaala home">
            <span>KS</span>
            KalaShaala
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/" className="pill-button soft inline-flex items-center gap-2">
              <ArrowLeft size={17} />
              Home
            </Link>
            <button onClick={() => setDark((value) => !value)} className="icon-button" aria-label="Toggle dark mode">
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </nav>
      </header>

      <main className="register-shell">
        <section className="register-hero">
          <div className="register-copy">
            <span className="eyebrow">{copy.eyebrow}</span>
            <h1>{copy.title}</h1>
            <p>{copy.intro}</p>
            <div className="register-switch">
              <Link className={isCustomer ? "active" : ""} to="/register-customer">Customer</Link>
              <Link className={isArtist ? "active" : ""} to="/register-artist">Artist</Link>
            </div>
          </div>
        </section>

        <section className="register-form-panel">
          <form className="form-grid">
            {copy.fields.map((label) => (
              <input key={label} placeholder={label} type={getFieldType(label)} />
            ))}
            {isArtist ? (
              <select aria-label="Primary art category">
                <option>Painting</option>
                <option>Sculpture</option>
                <option>Folk Art</option>
                <option>Tribal Art</option>
                <option>Digital Art</option>
                <option>Photography</option>
                <option>Handicrafts</option>
                <option>Textile Arts</option>
              </select>
            ) : isCustomer ? (
              <fieldset className="interest-picker">
                <legend>Which interior artisan services do you need?</legend>
                <div>
                  {customerInterests.map((interest) => (
                    <label key={interest}>
                      <input type="checkbox" name="customerInterests" value={interest} />
                      <span>{interest}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : null}
            <textarea placeholder={isArtist ? "Artist bio and craft story" : "Tell us about your interior project, room type, preferred style, budget, or timeline"} />
            {isArtist ? (
              <div className="upload-control">
                <label className="upload-box">
                  <Upload size={20} />
                  Upload Artwork (max 5 MB)
                  <input
                    type="file"
                    accept={ARTWORK_UPLOAD_ACCEPT}
                    onChange={(event) => handleUploadChange(event, "artwork")}
                  />
                </label>
                {uploadFeedback.artwork && (
                  <p className={`upload-feedback ${uploadFeedback.artwork.type === "error" ? "is-error" : ""}`}>
                    {uploadFeedback.artwork.text}
                  </p>
                )}
              </div>
            ) : isCustomer && (
              <div className="upload-control">
                <label className="upload-box">
                  <HeartHandshake size={20} />
                  Optional Partner Document (max 5 MB)
                  <input
                    type="file"
                    accept={ARTWORK_UPLOAD_ACCEPT}
                    onChange={(event) => handleUploadChange(event, "partnerDocument")}
                  />
                </label>
                {uploadFeedback.partnerDocument && (
                  <p className={`upload-feedback ${uploadFeedback.partnerDocument.type === "error" ? "is-error" : ""}`}>
                    {uploadFeedback.partnerDocument.text}
                  </p>
                )}
              </div>
            )}
            <button type="button" className="cta-primary">{copy.button}</button>
          </form>
          <aside className="register-benefits">
            <Palette size={28} />
            <h2>{isCustomer ? "Built for interiors" : "Why register?"}</h2>
            <p>
              {isCustomer
                ? "Save interior-focused artisans, share your decor requirements, and connect with creators for homes, offices, studios, cafes, hotels, and other designed spaces."
                : "Save artists, receive event invites, access curated art categories, and help KalaShaala build a stronger creative economy for Indian artists."}
            </p>
          </aside>
        </section>
      </main>
    </div>
  );
}

export default RegisterPage;

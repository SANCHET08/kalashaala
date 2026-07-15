import { useEffect, useState } from "react";
import { Languages } from "lucide-react";

const GOOGLE_TRANSLATE_SCRIPT_ID = "google-translate-script";
const GOOGLE_TRANSLATE_ELEMENT_ID = "google_translate_element";
const STORAGE_KEY = "kalaShaalaLanguage";

const supportedLanguages = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "bn", label: "Bengali" },
  { code: "ta", label: "Tamil" },
  { code: "te", label: "Telugu" },
  { code: "mr", label: "Marathi" },
  { code: "gu", label: "Gujarati" },
  { code: "kn", label: "Kannada" },
  { code: "ml", label: "Malayalam" },
  { code: "pa", label: "Punjabi" },
  { code: "ur", label: "Urdu" },
  { code: "as", label: "Assamese" },
  { code: "or", label: "Odia" },
  { code: "ne", label: "Nepali" },
  { code: "si", label: "Sinhala" },
  { code: "ar", label: "Arabic" },
  { code: "fr", label: "French" },
  { code: "es", label: "Spanish" },
  { code: "de", label: "German" },
  { code: "it", label: "Italian" },
  { code: "pt", label: "Portuguese" },
  { code: "ru", label: "Russian" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "zh-CN", label: "Chinese" },
];

function getInitialLanguage() {
  if (typeof window === "undefined") return "en";
  return localStorage.getItem(STORAGE_KEY) || "en";
}

function setTranslateCookie(languageCode) {
  const hostname = window.location.hostname;
  const cookieValue = languageCode === "en" ? "" : `/en/${languageCode}`;
  const maxAge = languageCode === "en" ? "0" : `${60 * 60 * 24 * 365}`;

  document.cookie = `googtrans=${cookieValue}; path=/; max-age=${maxAge}`;

  if (hostname.includes(".")) {
    document.cookie = `googtrans=${cookieValue}; path=/; domain=.${hostname}; max-age=${maxAge}`;
  }
}

function triggerGoogleTranslate(languageCode) {
  const combo = document.querySelector(".goog-te-combo");

  if (!combo) return false;

  combo.value = languageCode === "en" ? "" : languageCode;
  combo.dispatchEvent(new Event("change"));
  return true;
}

function loadGoogleTranslate() {
  if (window.google?.translate?.TranslateElement) return;

  window.googleTranslateElementInit = () => {
    new window.google.translate.TranslateElement(
      {
        pageLanguage: "en",
        includedLanguages: supportedLanguages
          .filter(({ code }) => code !== "en")
          .map(({ code }) => code)
          .join(","),
        autoDisplay: false,
      },
      GOOGLE_TRANSLATE_ELEMENT_ID
    );
  };

  if (document.getElementById(GOOGLE_TRANSLATE_SCRIPT_ID)) return;

  const script = document.createElement("script");
  script.id = GOOGLE_TRANSLATE_SCRIPT_ID;
  script.src =
    "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  script.async = true;
  document.body.appendChild(script);
}

export default function LanguageSelector() {
  const [selectedLanguage, setSelectedLanguage] = useState(getInitialLanguage);
  const [isTranslatorReady, setIsTranslatorReady] = useState(false);

  useEffect(() => {
    loadGoogleTranslate();
  }, []);

  useEffect(() => {
    document.documentElement.lang = selectedLanguage;

    const interval = window.setInterval(() => {
      const isReady = Boolean(document.querySelector(".goog-te-combo"));
      setIsTranslatorReady(isReady);

      if (isReady) {
        triggerGoogleTranslate(selectedLanguage);
        window.clearInterval(interval);
      }
    }, 400);

    return () => window.clearInterval(interval);
  }, [selectedLanguage]);

  const handleLanguageChange = (event) => {
    const nextLanguage = event.target.value;

    localStorage.setItem(STORAGE_KEY, nextLanguage);
    setSelectedLanguage(nextLanguage);
    setTranslateCookie(nextLanguage);

    if (nextLanguage === "en") {
      window.location.reload();
      return;
    }

    triggerGoogleTranslate(nextLanguage);
  };

  return (
    <div className="language-selector notranslate" translate="no">
      <label htmlFor="site-language" className="language-selector__label">
        <Languages size={18} />
        <span>Language</span>
      </label>
      <select
        id="site-language"
        value={selectedLanguage}
        onChange={handleLanguageChange}
        aria-label="Select website language"
        title={
          isTranslatorReady
            ? "Select website language"
            : "Language options are loading"
        }
      >
        {supportedLanguages.map((language) => (
          <option key={language.code} value={language.code}>
            {language.label}
          </option>
        ))}
      </select>
      <div
        id={GOOGLE_TRANSLATE_ELEMENT_ID}
        className="language-selector__google"
        aria-hidden="true"
      />
    </div>
  );
}

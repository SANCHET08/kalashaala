import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Mail,
  MapPin,
  Moon,
  Phone,
  ShieldCheck,
  Sun,
  UserRound,
} from "lucide-react";

const fallbackEvent = {
  event: "KalaShaala Event",
  type: "Events & Workshops",
  place: "KalaShaala Chapter",
  date: "Upcoming",
};

function EventRegistration() {
  const [searchParams] = useSearchParams();
  const [dark, setDark] = useState(false);
  const eventDetails = useMemo(() => ({
    event: searchParams.get("event") || fallbackEvent.event,
    type: searchParams.get("type") || fallbackEvent.type,
    place: searchParams.get("place") || fallbackEvent.place,
    date: searchParams.get("date") || fallbackEvent.date,
  }), [searchParams]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    return () => document.documentElement.classList.remove("dark");
  }, [dark]);

  return (
    <div className="event-registration-page min-h-screen bg-[#fff8ed] text-[#24150f] transition-colors duration-300 dark:bg-[#100d11] dark:text-[#fff6e6]">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/30 bg-white/72 backdrop-blur-2xl dark:border-white/10 dark:bg-[#100d11]/76">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
          <Link to="/" className="brand-mark" aria-label="Back to KalaShaala home">
            <span>KS</span>
            KalaShaala
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/#events" className="pill-button soft inline-flex items-center gap-2">
              <ArrowLeft size={17} />
              Events
            </Link>
            <button onClick={() => setDark((value) => !value)} className="icon-button" aria-label="Toggle dark mode">
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </nav>
      </header>

      <main className="event-registration-shell">
        <section className="event-registration-card">
          <div className="event-registration-copy">
            <span className="eyebrow"><CalendarDays size={16} /> Event Registration</span>
            <h1>Reserve your KalaShaala seat</h1>
            <p>Register with your basic credentials and our team will share confirmation details for the selected event.</p>

            <div className="selected-event-card" aria-label="Selected event details">
              <span>{eventDetails.type}</span>
              <h2>{eventDetails.event}</h2>
              <p><MapPin size={17} /> {eventDetails.place}</p>
              <p><CalendarDays size={17} /> {eventDetails.date}</p>
            </div>
          </div>

          <form className="event-registration-form">
            <label>
              <span><UserRound size={16} /> Full Name</span>
              <input required autoComplete="name" placeholder="Enter your full name" />
            </label>
            <label>
              <span><Mail size={16} /> Email Address</span>
              <input required type="email" autoComplete="email" placeholder="you@example.com" />
            </label>
            <label>
              <span><Phone size={16} /> Mobile Number</span>
              <input required type="tel" autoComplete="tel" placeholder="+91 98765 43210" maxLength={16} />
            </label>
            <label>
              <span><ShieldCheck size={16} /> Password</span>
              <input required type="password" autoComplete="new-password" placeholder="Create password" minLength={8} maxLength={128} />
            </label>
            <label>
              <span>Interest Type</span>
              <select required defaultValue="">
                <option value="" disabled>Select your interest</option>
                <option>Attend Event</option>
                <option>Join Workshop</option>
                <option>Volunteer</option>
                <option>Sponsor Artist</option>
                <option>Partner with NGO</option>
              </select>
            </label>
            <label>
              <span>Number of Seats</span>
              <select required defaultValue="1">
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
              </select>
            </label>
            <label className="event-form-wide">
              <span>Message</span>
              <textarea placeholder="Tell us anything our team should know" maxLength={500} />
            </label>
            <button type="button" className="cta-primary event-form-wide">
              <CheckCircle2 size={18} />
              Submit Registration
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default EventRegistration;

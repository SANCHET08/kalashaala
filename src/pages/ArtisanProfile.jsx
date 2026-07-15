import { ArrowLeft, Mail, MapPin, Palette, Phone } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import RatingSystem from "../components/RatingSystem";
import { getArtisanProfile } from "../data/artisanProfiles";
import "./ArtisanProfile.css";

export default function ArtisanProfile() {
  const { artistId, id } = useParams();
  const profile = getArtisanProfile(artistId || id);

  if (!profile) {
    return (
      <main className="artisan-profile-page">
        <section className="artisan-profile-empty">
          <Palette size={42} />
          <h1>Artist profile not found</h1>
          <p>This artist may have moved or the profile has not been published yet.</p>
          <Link to="/explore-artists">Back to Explore Artists</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="artisan-profile-page">
      <section className="artisan-profile-hero">
        <div className="artisan-profile-hero__content">
          <Link className="profile-back-link" to="/explore-artists">
            <ArrowLeft size={18} />
            Back to map
          </Link>
          <p className="profile-eyebrow">{profile.state}</p>
          <h1>{profile.name}</h1>
          <p className="profile-subtitle">{profile.bio}</p>
          <div className="profile-meta-row">
            <span><MapPin size={16} /> {profile.state}</span>
            <span><Palette size={16} /> {profile.artStyle}</span>
          </div>
          <RatingSystem itemId={profile.id} initialRating={profile.rating} label={profile.name} />
        </div>
        <div className="profile-portrait" aria-label={`${profile.name} artwork preview`}>
          {profile.profileImage ? (
            <img className="profile-portrait__image" src={profile.profileImage} alt={profile.imageAlt || profile.name} />
          ) : (
            <div className="profile-portrait__motif" />
          )}
          <strong>{profile.artStyle}</strong>
          <span>{profile.experience} of practice</span>
          {profile.imageCredit && <small>{profile.imageCredit}</small>}
        </div>
      </section>

      <section className="artist-work-section">
        <div className="artist-section-heading">
          <p>Art and Pictures</p>
          <h2>Artwork Gallery</h2>
        </div>
        <div className="artist-work-grid">
          {profile.works.map((work) => (
            <article key={work.id} className="artist-work-card">
              <div className={`artist-work-picture ${work.motif}`} aria-label={work.title}>
                {work.image ? <img src={work.image} alt={work.imageAlt || work.title} loading="lazy" /> : <span />}
              </div>
              <div className="artist-work-copy">
                <strong>{work.title}</strong>
                <p>{work.description}</p>
                <div>
                  <span>{work.medium}</span>
                  <span>{work.year}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="artist-contact-strip">
        <div>
          <h2>Contact {profile.name.split(" ")[0]}</h2>
          <p>Use these details to ask about custom artwork, decor pieces, or interior artisan work.</p>
        </div>
        <div className="artist-contact-actions">
          <a href={`mailto:${profile.email}`}>
            <Mail size={17} />
            Email
          </a>
          <a href={`tel:${profile.phone.replace(/\s/g, "")}`}>
            <Phone size={17} />
            Call
          </a>
        </div>
      </section>
    </main>
  );
}

import { Link, Navigate, useLocation } from "react-router-dom";
import { ArrowRight, Brush, LockKeyhole, Palette, UserRoundPlus } from "lucide-react";
import bestArtMonthDummy from "../assets/best-art-month-dummy.png";

function AuthGateway() {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const intendedRoute = location.state?.from;

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return (
    <main className="auth-gateway">
      <section className="auth-gateway__hero">
        <div className="auth-gateway__copy">
          <Link to="/" className="brand-mark auth-gateway__brand" aria-label="KalaShaala">
            <span>KS</span>
            KalaShaala
          </Link>
          <p className="eyebrow">Private access for KalaShaala members</p>
          <h1>Sign in before exploring India's living art network</h1>
          <p>
            Login or create your account to discover artisans, save interior art interests,
            register for events, and support handmade work.
          </p>
          <div className="auth-gateway__actions">
            <Link to="/login" state={{ from: intendedRoute }} className="auth-gateway__primary">
              <LockKeyhole size={18} />
              Login
              <ArrowRight size={18} />
            </Link>
            <Link to="/register-customer" className="auth-gateway__secondary">
              <UserRoundPlus size={18} />
              Sign up as Customer
            </Link>
            <Link to="/register-artist" className="auth-gateway__secondary auth-gateway__secondary--warm">
              <Palette size={18} />
              Sign up as Artist
            </Link>
          </div>
        </div>

        <div className="auth-gateway__visual" aria-label="Featured KalaShaala artwork preview">
          <img src={bestArtMonthDummy} alt="Featured handmade art preview" />
          <div>
            <Brush size={18} />
            <span>Member access</span>
          </div>
        </div>
      </section>
    </main>
  );
}

export default AuthGateway;

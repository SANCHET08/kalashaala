import KalaShaalaNGO from "./pages/KalaShaalaNGO";
import RegisterPage from "./pages/RegisterPage";
import { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Breadcrumbs from "./components/Breadcrumbs";
import LanguageSelector from "./components/LanguageSelector";
import kalashalaLogo from "./assets/kalashala-logo.jpeg";

const ExploreArtisan = lazy(() => import("./pages/ExploreArtisan"));
const ArtisanProfile = lazy(() => import("./pages/ArtisanProfile"));
const GovArtisanVisualization = lazy(() => import("./pages/GovArtisanVisualization"));
const ArtisanDiscovery = lazy(() => import("./pages/ArtisanDiscovery"));
const EventRegistration = lazy(() => import("./pages/EventRegistration/EventRegistration"));
const Login = lazy(() => import("./pages/Login"));
const SubscribePage = lazy(() => import("./pages/SubscribePage"));

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isSplashLeaving, setIsSplashLeaving] = useState(false);

  useEffect(() => {
    const leaveTimer = window.setTimeout(() => setIsSplashLeaving(true), 1800);
    const removeTimer = window.setTimeout(() => setShowSplash(false), 2300);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  if (showSplash) {
    return (
      <div
        className={`site-splash${isSplashLeaving ? " site-splash--leaving" : ""}`}
        role="status"
        aria-label="KalaShaala is loading"
      >
        <img src={kalashalaLogo} alt="KalaShaala" />
        <span className="site-splash__loader" aria-hidden="true" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<div className="route-loader">Loading KalaShaala...</div>}>
        <Breadcrumbs />
        <LanguageSelector />
        <Routes>
          <Route path="/" element={<KalaShaalaNGO />} />
          <Route path="/explore-artists" element={<ExploreArtisan />} />
          <Route path="/artisans" element={<Navigate to="/explore-artists" replace />} />
          <Route path="/artisans/:id" element={<ArtisanProfile />} />
          <Route path="/artist/:artistId" element={<ArtisanProfile />} />
          <Route path="/gov-artisan-visualization" element={<GovArtisanVisualization />} />
          <Route path="/artists" element={<Navigate to="/explore-artists" replace />} />
          <Route path="/india-map" element={<Navigate to="/explore-artists" replace />} />
          <Route path="/artisan-discovery" element={<ArtisanDiscovery />} />
          <Route path="/event-registration" element={<EventRegistration />} />
          <Route path="/subscribe" element={<SubscribePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register-user" element={<RegisterPage type="user" />} />
          <Route path="/register-customer" element={<RegisterPage type="customer" />} />
          <Route path="/register-artist" element={<RegisterPage type="artist" />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;

import KalaShaalaNGO from "./pages/KalaShaalaNGO";
import RegisterPage from "./pages/RegisterPage";
import AuthGateway from "./pages/AuthGateway";
import { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
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

function ProtectedRoute({ children }) {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
}

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
          <Route path="/" element={<AuthGateway />} />
          <Route path="/home" element={<ProtectedRoute><KalaShaalaNGO /></ProtectedRoute>} />
          <Route path="/explore-artists" element={<ProtectedRoute><ExploreArtisan /></ProtectedRoute>} />
          <Route path="/artisans" element={<ProtectedRoute><Navigate to="/explore-artists" replace /></ProtectedRoute>} />
          <Route path="/artisans/:id" element={<ProtectedRoute><ArtisanProfile /></ProtectedRoute>} />
          <Route path="/artist/:artistId" element={<ProtectedRoute><ArtisanProfile /></ProtectedRoute>} />
          <Route path="/gov-artisan-visualization" element={<ProtectedRoute><GovArtisanVisualization /></ProtectedRoute>} />
          <Route path="/artists" element={<ProtectedRoute><Navigate to="/explore-artists" replace /></ProtectedRoute>} />
          <Route path="/india-map" element={<ProtectedRoute><Navigate to="/explore-artists" replace /></ProtectedRoute>} />
          <Route path="/artisan-discovery" element={<ProtectedRoute><ArtisanDiscovery /></ProtectedRoute>} />
          <Route path="/event-registration" element={<ProtectedRoute><EventRegistration /></ProtectedRoute>} />
          <Route path="/subscribe" element={<ProtectedRoute><SubscribePage /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register-customer" element={<RegisterPage type="customer" />} />
          <Route path="/register-artist" element={<RegisterPage type="artist" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;

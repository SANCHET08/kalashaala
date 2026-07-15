import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const routeLabels = {
  "/": "Home",
  "/explore-artists": "Explore Artists",
  "/artist": "Artist Profile",
  "/gov-artisan-visualization": "Govt Artisan Visualization",
  "/artisan-discovery": "Artisan Discovery",
  "/event-registration": "Event Registration",
  "/subscribe": "Subscribe",
  "/register-user": "User Registration",
  "/register-customer": "Customer Registration",
  "/register-artist": "Artist Registration",
};

function getCurrentLabel(pathname) {
  if (pathname.startsWith("/artist/") || pathname.startsWith("/artisans/")) return "Artist Profile";
  return routeLabels[pathname] || pathname.replace(/^\/+/, "").replace(/-/g, " ");
}

export default function Breadcrumbs() {
  const { pathname } = useLocation();

  if (pathname === "/") return null;

  const currentLabel = getCurrentLabel(pathname);

  return (
    <nav className="site-breadcrumbs" aria-label="Breadcrumb">
      <ol>
        <li>
          <Link to="/" aria-label="Go to KalaShaala home">
            <Home size={15} />
            <span>Home</span>
          </Link>
        </li>
        <li aria-hidden="true" className="breadcrumb-separator">
          <ChevronRight size={14} />
        </li>
        <li aria-current="page">
          <span>{currentLabel}</span>
        </li>
      </ol>
    </nav>
  );
}

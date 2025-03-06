// src/layout/Layout.jsx
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "../components/Sidebar";

const Layout = () => {
  // Desktop Collapsing
  const [collapsed, setCollapsed] = useState(false);
  // Mobile Overlay
  const [mobileOpen, setMobileOpen] = useState(false);

  // Body Scroll Lock, wenn mobile Overlay geöffnet ist
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [mobileOpen]);

  return (
    // Safe-Area-Padding via Tailwind (oben und unten)
    <div
      className="min-h-screen bg-[#1e1e1e] pt-[calc(1rem+env(safe-area-inset-top))] pb-[calc(1rem+env(safe-area-inset-bottom))]"
    >
      {/* 1) Mobile-Overlay: nur sichtbar, wenn mobileOpen */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex md:hidden">
          {/* Klick aufs Overlay schließt */}
          <div className="absolute inset-0" onClick={() => setMobileOpen(false)} />
          {/* Sidebar im Mobile-Modus, fixiert mit Safe-Area-Padding */}
          <div className="absolute top-0 left-0 bottom-0 w-64 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
            <Sidebar
              collapsed={false}
              setCollapsed={() => {}}
              isMobileOpen
              setMobileOpen={setMobileOpen}
            />
          </div>
        </div>
      )}

      {/* 2) Haupt-Flex-Container: Sidebar (Desktop) + Content */}
      <div className="flex">
        {/* Desktop-Sidebar */}
        <div className="hidden md:block">
          <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        </div>

        {/* Hauptbereich */}
        <div
          className="flex-1 p-10 text-white"
          style={{ backgroundColor: "oklch(0.205 0 0)", minHeight: "100vh" }}
        >
          {/* Hamburger-Button nur, wenn Overlay nicht offen */}
          {!mobileOpen && (
            <button
              className="md:hidden p-2 bg-gray-800 rounded-lg mb-4"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={24} />
            </button>
          )}

          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;

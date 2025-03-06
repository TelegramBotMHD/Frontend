import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Warehouse,
  Gauge,
  Upload,
  Download,
  PackageSearch,
  Factory,
  Boxes,
  Building2,
  AlertTriangle,
  UserCog,
  LogOut,
  Menu,
  ChevronLeft,
  X,
  LineChart,
  ClipboardList,  // HACCP
  Truck,
  Thermometer,
  Search,
  Wrench,
  BookOpen,
  ChevronDown,
  ChevronRight,
  KeyRound,
  Clock
} from "lucide-react";
import PopoutPortal from "./PopoutPortal";

const Sidebar = ({ collapsed, setCollapsed, isMobileOpen, setMobileOpen }) => {
  const [openHACCP, setOpenHACCP] = useState(false);

  // Für das Popout-Menü (HACCP) im eingeklappten Zustand
  const haccpBtnRef = useRef(null);
  const [popoutPos, setPopoutPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (collapsed && openHACCP && haccpBtnRef.current) {
      const rect = haccpBtnRef.current.getBoundingClientRect();
      setPopoutPos({
        top: rect.top,
        left: rect.right + 8,
      });
    }
  }, [collapsed, openHACCP]);

  const handleCloseHACCP = () => {
    setOpenHACCP(false);
  };

  return (
    <div
      className={`
        flex flex-col
        text-gray-300
        shadow-lg
        transition-all
        duration-300
        relative
        z-50
        ${collapsed ? "w-20" : "w-72"}
      `}
      style={{
        /* 
           1) 100svh für dynamische Höhe in Safari 
           2) Safe-Area-Abstand oben/unten 
        */
        height: "100svh",
        paddingTop: "calc(env(safe-area-inset-top) + 0.5rem)",
        paddingBottom: "calc(env(safe-area-inset-bottom) + 0.5rem)",
        backgroundColor: "#1e1e1e",
        overflow: "visible",
      }}
    >
      {/* Kopfzeile (Mobile/Toggle) */}
      <div className="mb-4 flex justify-end px-4">
        {isMobileOpen ? (
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600"
          >
            <X size={24} />
          </button>
        ) : (
          setCollapsed && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600"
            >
              {collapsed ? <ChevronLeft size={24} /> : <Menu size={24} />}
            </button>
          )
        )}
      </div>

      {/* Logo / Icon */}
      <div className="flex justify-center mb-6">
        <Warehouse size={collapsed ? 30 : 50} className="text-white" />
      </div>

      {/* 
        Menübereich: 
        flex-1 => füllt den restlichen Platz, 
        overflow-y-auto => scrollbar bei Bedarf
      */}
      <nav className="flex-1 space-y-2 text-base overflow-y-auto px-2">
        <SidebarLink to="/" icon={<Gauge size={24} />} label="Dashboard" collapsed={collapsed} />
        <SidebarLink to="/einbuchen" icon={<Upload size={24} />} label="Einbuchen" collapsed={collapsed} />
        <SidebarLink to="/ausbuchen" icon={<Download size={24} />} label="Ausbuchen" collapsed={collapsed} />
        <SidebarLink to="/buchungshistorie" icon={<Clock size={24} />} label="Buchungshistorie" collapsed={collapsed} />
        <SidebarLink to="/artikelverwaltung" icon={<PackageSearch size={24} />} label="Artikelverwaltung" collapsed={collapsed} />
        <SidebarLink to="/lieferantenverwaltung" icon={<Factory size={24} />} label="Lieferantenverwaltung" collapsed={collapsed} />
        <SidebarLink to="/artikelliste" icon={<Boxes size={24} />} label="Artikelliste" collapsed={collapsed} />
        <SidebarLink to="/lieferantenliste" icon={<Building2 size={24} />} label="Lieferantenliste" collapsed={collapsed} />
        <SidebarLink to="/kritische" icon={<AlertTriangle size={24} />} label="Kritische Bestände" collapsed={collapsed} />
        <SidebarLink to="/benutzerverwaltung" icon={<UserCog size={24} />} label="Benutzerverwaltung" collapsed={collapsed} />
        <SidebarLink to="/kpi" icon={<LineChart size={24} />} label="KPI" collapsed={collapsed} />
        <SidebarLink to="/logins" icon={<KeyRound size={24} />} label="Logins" collapsed={collapsed} />

        {/* HACCP-Menü */}
        <div className="relative">
          <button
            ref={haccpBtnRef}
            onClick={() => setOpenHACCP(!openHACCP)}
            className="flex items-center justify-between gap-3 w-full p-3 rounded-lg hover:bg-gray-700 transition"
          >
            <div className="flex items-center gap-3">
              <ClipboardList size={24} />
              {!collapsed && <span>HACCP</span>}
            </div>
            {!collapsed && (openHACCP ? <ChevronDown size={20} /> : <ChevronRight size={20} />)}
          </button>

          {/* Accordion (ausgeklappt) */}
          {!collapsed && (
            <div
              className={`
                ml-6 space-y-1 mt-1 overflow-hidden transition-all duration-300
                ${openHACCP ? "max-h-[9999px]" : "max-h-0"}
              `}
            >
              <SidebarLink
                to="/haccp/konzept"
                icon={<BookOpen size={24} />}
                label="HACCP-Konzept"
                isSubLink
                onItemClick={handleCloseHACCP}
              />
              <SidebarLink
                to="/haccp/wareneingang"
                icon={<Truck size={24} />}
                label="Wareneingang"
                isSubLink
                onItemClick={handleCloseHACCP}
              />
              <SidebarLink
                to="/haccp/temperaturkontrolle"
                icon={<Thermometer size={24} />}
                label="Temperaturkontrolle"
                isSubLink
                onItemClick={handleCloseHACCP}
              />
              <SidebarLink
                to="/haccp/automateninspektion"
                icon={<Search size={24} />}
                label="Automateninspektion"
                isSubLink
                onItemClick={handleCloseHACCP}
              />
              <SidebarLink
                to="/haccp/korrekturmassnahmen"
                icon={<Wrench size={24} />}
                label="Korrekturmaßnahmen"
                isSubLink
                onItemClick={handleCloseHACCP}
              />
            </div>
          )}

          {/* Popout bei eingeklappter Sidebar */}
          {collapsed && openHACCP && (
            <PopoutPortal>
              <div
                style={{
                  position: "fixed",
                  top: popoutPos.top,
                  left: popoutPos.left,
                  backgroundColor: "#1e1e1e",
                  padding: "0.5rem",
                  borderRadius: "0.25rem",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.5)",
                  zIndex: 9999,
                  minWidth: "8rem",
                  maxWidth: "300px",
                  maxHeight: "80vh",
                  overflowY: "auto",
                  overflowX: "hidden",
                }}
              >
                <SidebarLink
                  to="/haccp/konzept"
                  icon={<BookOpen size={20} />}
                  label="HACCP-Konzept"
                  isSubLink
                  popOut
                  onItemClick={handleCloseHACCP}
                />
                <SidebarLink
                  to="/haccp/wareneingang"
                  icon={<Truck size={20} />}
                  label="Wareneingang"
                  isSubLink
                  popOut
                  onItemClick={handleCloseHACCP}
                />
                <SidebarLink
                  to="/haccp/temperaturkontrolle"
                  icon={<Thermometer size={20} />}
                  label="Temperaturkontrolle"
                  isSubLink
                  popOut
                  onItemClick={handleCloseHACCP}
                />
                <SidebarLink
                  to="/haccp/automateninspektion"
                  icon={<Search size={20} />}
                  label="Automateninspektion"
                  isSubLink
                  popOut
                  onItemClick={handleCloseHACCP}
                />
                <SidebarLink
                  to="/haccp/korrekturmassnahmen"
                  icon={<Wrench size={20} />}
                  label="Korrekturmaßnahmen"
                  isSubLink
                  popOut
                  onItemClick={handleCloseHACCP}
                />
              </div>
            </PopoutPortal>
          )}
        </div>
      </nav>

      {/* Logout am unteren Rand, plus extra Safe-Area-Abstand */}
      <div
        className="
          mt-auto
          px-4
          pt-2
          pb-[calc(env(safe-area-inset-bottom)+2rem)]
        "
      >
        <SidebarLink
          to="/logout"
          icon={<LogOut size={24} />}
          label="Logout"
          isLogout
          collapsed={collapsed}
        />
      </div>
    </div>
  );
};

/* ---------------------------------------------------
   SidebarLink-Komponente (Portal-basierter Tooltip)
---------------------------------------------------- */
const SidebarLink = ({
  to,
  icon,
  label,
  collapsed,
  isSubLink,
  isLogout,
  popOut,
  onItemClick,
}) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  const navigate = useNavigate();

  // Tooltip
  const linkRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });

  const handleMouseEnter = () => {
    if (!popOut && collapsed) {
      setHovered(true);
      if (linkRef.current) {
        const rect = linkRef.current.getBoundingClientRect();
        setTooltipPos({
          top: rect.top + rect.height / 2,
          left: rect.right + 8,
        });
      }
    }
  };
  const handleMouseLeave = () => setHovered(false);

  const handleClick = () => {
    if (onItemClick) onItemClick();
  };

  return (
    <div
      ref={linkRef}
      className="relative"
      style={{ overflow: "visible" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        to={to}
        onClick={handleClick}
        className={`
          flex items-center gap-3 p-3 rounded-lg transition-colors
          hover:bg-gray-700
          ${isActive ? "bg-gray-700 border-l-4 border-blue-500" : ""}
          ${isSubLink && !popOut ? "ml-2" : ""}
          w-full
        `}
      >
        {icon}
        {(!collapsed || popOut) && <span className="font-medium">{label}</span>}
      </Link>

      {/* Tooltip via Portal (eingeklappter Zustand) */}
      {hovered && collapsed && !popOut && (
        <PopoutPortal>
          <div
            style={{
              position: "fixed",
              top: tooltipPos.top,
              left: tooltipPos.left,
              transform: "translateY(-50%)",
              backgroundColor: "black",
              color: "white",
              padding: "4px 8px",
              borderRadius: "4px",
              zIndex: 9999,
              whiteSpace: "nowrap",
              boxShadow: "0 2px 6px rgba(0,0,0,0.5)",
            }}
          >
            {label}
          </div>
        </PopoutPortal>
      )}
    </div>
  );
};

export default Sidebar;

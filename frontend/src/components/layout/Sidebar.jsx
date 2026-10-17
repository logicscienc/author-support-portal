// src/components/layout/Sidebar.jsx
// Shared by author and admin. Pass the links for the role.
import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { FiChevronUp, FiLogOut } from "react-icons/fi";
import { useAuth } from "../../context/useAuth";
import logo from "../../images/logo.png";

export default function Sidebar({ links, onNavigate }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close the logout menu when the user clicks anywhere else.
  useEffect(() => {
    if (!menuOpen) return;

    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const initial = user.name?.trim()[0]?.toUpperCase() ?? "?";
  const roleLabel = user.role === "ADMIN" ? "Admin" : "Author";

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
      isActive
        ? "bg-white/10 text-white"
        : "text-slate-300 hover:bg-white/5 hover:text-white"
    }`;

  return (
    <div className="flex h-full flex-col bg-[#101a35] text-white">
      <div className="flex items-center gap-3 px-6 py-6">
        <img src={logo} alt="" className="h-9 w-9 object-contain" />
        <span className="text-xl font-semibold tracking-tight">BookLeaf</span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} onClick={onNavigate} className={linkClass}>
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logged-in user, with a small menu that holds Log out */}
      <div ref={menuRef} className="relative border-t border-white/10 p-3">
        {menuOpen && (
          <div className="absolute inset-x-3 bottom-full mb-2 overflow-hidden rounded-xl border border-white/10 bg-[#1a2547] shadow-lg">
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm text-slate-200 transition hover:bg-white/10"
            >
              <FiLogOut size={16} />
              Log out
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-white/5"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#7775b9] text-sm font-semibold">
            {initial}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">{user.name}</span>
            <span className="block text-xs text-slate-400">{roleLabel}</span>
          </span>
          <FiChevronUp
            size={16}
            className={`shrink-0 text-slate-400 transition ${menuOpen ? "" : "rotate-180"}`}
          />
        </button>
      </div>
    </div>
  );
}
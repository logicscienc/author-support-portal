
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { FiMenu } from "react-icons/fi";
import Sidebar from "../components/layout/Sidebar";
import logo from "../images/logo.png";

export default function DashboardLayout({ links }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f4f5fb] md:flex">
      {/* Dark overlay behind the drawer (phones only) */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}


      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transition-transform duration-200 md:sticky md:top-0 md:h-screen md:shrink-0 md:translate-x-0 ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar links={links} onNavigate={() => setDrawerOpen(false)} />
      </aside>

      <div className="min-w-0 flex-1">
        
        <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          >
            <FiMenu size={22} />
          </button>
          <img src={logo} alt="" className="h-7 w-7 object-contain" />
          <span className="text-lg font-semibold text-[#171a35]">BookLeaf</span>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
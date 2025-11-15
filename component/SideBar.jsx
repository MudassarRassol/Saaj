"use client";

import Link from "next/link";
import { usePathname } from 'next/navigation';
import { useState } from "react";
import { LayoutDashboard, Package, Users, HistoryIcon, LogOut, Menu, X, Shirt, ShoppingCart, TrendingUp } from 'lucide-react';
import { Button } from "../components/ui/button";
import Image from "next/image";
import logo from "../app/assests/logo.jpeg";

const menuItems = [
  { name: "Dashboard", href: "/pages/owner", icon: LayoutDashboard },
  { name: "Collections", href: "/pages/owner/inventory", icon: Shirt },
  { name: "Sales", href: "/pages/owner/orders", icon: ShoppingCart },
  // { name: "Analytics", href: "/pages/owner/analytics", icon: TrendingUp },
  { name: "Team", href: "/pages/owner/users", icon: Users },
];

import axios from "axios";
import { useRouter } from 'next/navigation';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.post("/api/logout");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
      router.push("/pages/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden absolute top-0 left-0 w-full z-50 flex items-center justify-between bg-white border-b p-3 shadow-md">
        <div className="flex items-center gap-3">
          <Image
            src={logo || "/placeholder.svg"}
            alt="Logo"
            width={40}
            height={40}
            className="dark:invert rounded"
          />
          <span className="text-xl font-extrabold text-slate-900">SAAJ</span>
        </div>
        <button onClick={() => setIsOpen(true)} className="p-1 hover:bg-gray-100 rounded">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity md:hidden ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsOpen(false)}
      ></div>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-64 bg-gradient-to-b from-slate-50 to-white z-50 transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:flex md:w-64
          flex flex-col border-r border-slate-200 shadow-lg
        `}
      >
        {/* Mobile Close Button */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 md:hidden">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-slate-900">SAAJ</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Logo for desktop */}
        <div className="hidden md:flex items-center gap-3 px-4 py-5 border-b border-slate-200">
          <div className="w-10 h-10 rounded-lg  flex items-center justify-center shadow-md">
            <Image
              src={logo || "/placeholder.svg"}
              alt="Logo"
              width={32}
              height={32}
              // className="invert"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-slate-900">SAAJ</h1>
            <p className="text-xs text-slate-500 font-medium">Clothing</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  active
                    ? "bg-[#2E426F] text-white font-semibold shadow-md"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
                onClick={() => setIsOpen(false)}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Owner Info Section */}
        <div className="border-t border-slate-200 p-4 flex items-center justify-between gap-3 bg-slate-50">
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Owner</p>
            <p className="text-sm font-semibold text-slate-900">SAAJ Admin</p>
          </div>
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="h-9 w-9 p-0 hover:bg-red-50 hover:text-red-600 transition-colors"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </aside>
    </>
  );
}

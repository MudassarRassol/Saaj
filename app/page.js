"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { Button } from "../components/ui/button";
import { ArrowRight, ShoppingBag, TrendingUp, BarChart3 } from 'lucide-react';
import callogo from './assests/clothing.jpg'
import logo from './assests/saajlogo.jpeg'
export default function Page() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("login");
    const role = localStorage.getItem("role");

    if (isLoggedIn === "true") {
      if (role === "admin") {
        router.push("/pages/owner");
      } else if (role === "employee") {
        router.push("/pages/staff");
      }
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-slate-50 dark:to-slate-950">
      <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white/80 dark:bg-slate-950/80 backdrop-blur-md shadow-sm border-b border-border" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src={logo} alt="Logo" width={40} height={80} className="dark:invert" />
            {/* <span className="font-bold text-lg hidden sm:inline">SAAJ</span> */}
          </div>
          <Link href={"/pages/login"}>
            <Button variant="outline" size="sm">Login</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 sm:py-32 text-center max-w-6xl mx-auto w-full">
        <div className="space-y-6 mb-12">
          <div className="inline-block">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 text-sm font-medium border border-blue-200 dark:border-blue-800">
              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
              Trusted by Fashion Retailers
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground tracking-tight">
            Manage Your <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Clothing Business</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Complete inventory management, sales tracking, and analytics—all in one intuitive platform designed for modern clothing retailers.
          </p>
        </div>
{/* 
        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link href={"/pages/login"}>
            <Button size="lg" className="gap-2">
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Button size="lg" variant="outline">
            Watch Demo
          </Button>
        </div> */}

        <div className="w-full max-w-3xl rounded-lg overflow-hidden border border-border shadow-lg bg-card">
          <Image
            src={callogo}
            alt="Dashboard preview"
            width={800}
            height={400}
            className="w-full h-auto"
          />
        </div>
      </section>

      {/* Features Section - Enhanced with icons and better layout */}
      <section className="py-20 px-6 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Powerful Features for Your Business
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to streamline operations and grow your clothing business
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group p-8 rounded-lg border border-border bg-background hover:border-primary hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Inventory Management</h3>
              <p className="text-muted-foreground">
                Add, update, and track all clothing items and accessories with real-time stock levels.
              </p>
            </div>

            <div className="group p-8 rounded-lg border border-border bg-background hover:border-primary hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-950/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Sales Tracking</h3>
              <p className="text-muted-foreground">
                Record every transaction and watch inventory update automatically in real-time.
              </p>
            </div>

            <div className="group p-8 rounded-lg border border-border bg-background hover:border-primary hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-950/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Analytics & Reports</h3>
              <p className="text-muted-foreground">
                View detailed insights on daily, weekly, or total earnings with beautiful charts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Grow Your Clothing Business?
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Join retailers using SAAJ to streamline their operations and increase profitability.
          </p>
          <Link href={"/pages/login"}>
            <Button size="lg" variant="secondary" className="gap-2">
              Start Free Today
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
  <footer className="py-12 px-6 border-t border-border bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="space-y-2">
              <p className="text-foreground font-semibold">Made by Mudassar Dev Team</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-muted-foreground">
                <a href="mailto:mudassarrasoolchishti@gmail.com" className="hover:text-primary transition-colors">
                  mudassarrasoolchishti@gmail.com
                </a>
                <span className="hidden sm:inline">•</span>
                <a href="tel:03057043427" className="hover:text-primary transition-colors">
                  03057043427
                </a>
              </div>
            </div>
            <p className="text-xs text-muted-foreground/60 mt-4">
              © {new Date().getFullYear()} SAAJ Clothing. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

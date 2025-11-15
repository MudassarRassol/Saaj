"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Button } from "../../../../components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import axios from "axios";
import { User, Mail, Lock, ShoppingBag } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("/api/signup", formData);
      if (res.status === 201) {
        router.push("/pages/login");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4 py-8">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-2xl">
          <CardHeader className="space-y-4 text-center pb-6">
            <div className="flex justify-center">
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#2E426F] to-[#1a2844] flex items-center justify-center shadow-lg">
                <ShoppingBag className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
                Join SAAJ
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Create your account to manage your clothing business
              </p>
            </div>
          </CardHeader>

          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    required
                    className="pl-10 h-11 border-border focus:border-[#2E426F] focus:ring-[#2E426F]/20"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    className="pl-10 h-11 border-border focus:border-[#2E426F] focus:ring-[#2E426F]/20"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="pl-10 h-11 border-border focus:border-[#2E426F] focus:ring-[#2E426F]/20"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-3 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 bg-[#2E426F] hover:bg-[#1a2844] text-white font-semibold mt-2"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center border-t border-border pt-6">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/pages/login"
                  className="font-semibold text-[#2E426F] hover:underline transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional info */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          © {new Date().getFullYear()} SAAJ Clothing. All rights reserved.
        </p>
      </div>
    </div>
  );
}

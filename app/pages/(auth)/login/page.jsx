"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Button } from "../../../../components/ui/button";
import Link from "next/link";
import { Mail, Lock, ShoppingBag } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import Image from "next/image";
import axios from "axios";
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleChange = (value) => {
    setFormData({
      ...formData,
      role: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("/api/login", {
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      if (res.status == 200 && res.data.role == "admin") {
        localStorage.setItem("login", "true");
        localStorage.setItem("role", res.data.role);
        localStorage.setItem("status", res.data.status);
        router.push("/pages/owner");
      }

      if (res.status == 200 && res.data.role == "employee") {
        localStorage.setItem("login", "true");
        localStorage.setItem("role", res.data.role);
        localStorage.setItem("status", res.data.status);
        router.push("/pages/staff");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
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
                Welcome Back
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Access your SAAJ Clothing dashboard
              </p>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
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
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    className="pl-10 h-11 border-border focus:border-[#2E426F] focus:ring-[#2E426F]/20"
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
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="pl-10 h-11 border-border focus:border-[#2E426F] focus:ring-[#2E426F]/20"
                  />
                </div>
              </div>

              <div className="space-y-2 w-full ">
                <Label htmlFor="role" className="text-sm font-medium">
                  Login as
                </Label>
                <Select onValueChange={handleRoleChange} value={formData.role}>
                  <SelectTrigger className="h-11 border-border w-full focus:border-[#2E426F] focus:ring-[#2E426F]/20">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin / Owner</SelectItem>
                    <SelectItem value="employee">Employee / Staff</SelectItem>
                  </SelectContent>
                </Select>
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
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center border-t border-border pt-6">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  href="/pages/signup"
                  className="font-semibold text-[#2E426F] hover:underline transition-colors"
                >
                  Create one
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

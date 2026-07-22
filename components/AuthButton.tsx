"use client";

import { LogIn, LogOut, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

interface SessionUser {
  email: string;
  name?: string;
  picture?: string;
}

export default function AuthButton() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/auth/me", { credentials: "include" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (isMounted && data?.authenticated) {
          setUser(data.user);
        }
      })
      .catch(() => {
        if (isMounted) {
          setUser(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="h-10 w-28 rounded-full bg-gray-100 animate-pulse" aria-hidden="true" />
    );
  }

  if (!user) {
    return (
      <a
        href="/api/auth/login"
        className="inline-flex h-10 items-center gap-2 rounded-full border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:border-blue-300 hover:text-blue-600"
      >
        <LogIn className="h-4 w-4" />
        Sign in
      </a>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="hidden items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-800 sm:flex">
        <ShieldCheck className="h-4 w-4" />
        <span className="max-w-36 truncate">{user.name || user.email}</span>
      </div>
      {user.picture ? (
        <img
          src={user.picture}
          alt=""
          className="h-9 w-9 rounded-full border border-gray-200 object-cover"
          referrerPolicy="no-referrer"
        />
      ) : null}
      <button
        type="button"
        onClick={handleLogout}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-colors hover:border-gray-300 hover:text-gray-900"
        aria-label="Sign out"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}

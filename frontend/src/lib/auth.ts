"use client";

import { create } from "zustand";
import type { User, AuthTokens } from "@/types";
import { authApi } from "./api";

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginWithGoogle: (code: string) => Promise<void>;
  loginWithLine: (code: string) => Promise<void>;
  devLogin: (email: string, password: string) => Promise<void>;
  completeProfile: (userType: "founder" | "mentor") => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setAuth: (user: User, tokens: AuthTokens) => void;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  tokens: null,
  isLoading: true,
  isAuthenticated: false,

  loginWithGoogle: async (code: string) => {
    const response = await authApi.loginWithGoogle(code);
    localStorage.setItem("tokens", JSON.stringify(response.tokens));
    localStorage.setItem("user", JSON.stringify(response.user));
    set({
      user: response.user,
      tokens: response.tokens,
      isAuthenticated: true,
    });
  },

  loginWithLine: async (code: string) => {
    const response = await authApi.loginWithLine(code);
    localStorage.setItem("tokens", JSON.stringify(response.tokens));
    localStorage.setItem("user", JSON.stringify(response.user));
    set({
      user: response.user,
      tokens: response.tokens,
      isAuthenticated: true,
    });
  },

  devLogin: async (email: string, password: string) => {
    const response = await authApi.devLogin(email, password);
    localStorage.setItem("tokens", JSON.stringify(response.tokens));
    localStorage.setItem("user", JSON.stringify(response.user));
    set({
      user: response.user,
      tokens: response.tokens,
      isAuthenticated: true,
    });
  },

  completeProfile: async (userType: "founder" | "mentor") => {
    const response = await authApi.completeProfile(userType);
    localStorage.setItem("user", JSON.stringify(response.user));
    set({ user: response.user });
  },

  logout: async () => {
    const { tokens } = get();
    if (tokens?.refresh) {
      try {
        await authApi.logout(tokens.refresh);
      } catch {
        // Ignore logout errors
      }
    }
    localStorage.removeItem("tokens");
    localStorage.removeItem("user");
    set({ user: null, tokens: null, isAuthenticated: false });
  },

  loadUser: async () => {
    try {
      const storedTokens = localStorage.getItem("tokens");
      const storedUser = localStorage.getItem("user");

      if (storedTokens && storedUser) {
        const tokens = JSON.parse(storedTokens);
        const user = JSON.parse(storedUser);
        set({ tokens, user, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  refreshUser: async () => {
    try {
      const user = await authApi.getMe();
      localStorage.setItem("user", JSON.stringify(user));
      set({ user });
    } catch {
      // Ignore refresh errors
    }
  },

  setAuth: (user: User, tokens: AuthTokens) => {
    localStorage.setItem("tokens", JSON.stringify(tokens));
    localStorage.setItem("user", JSON.stringify(user));
    set({ user, tokens, isAuthenticated: true });
  },
}));

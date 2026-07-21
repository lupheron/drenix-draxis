import type { AccessSession, AdminSession } from "@/lib/types";

const TOKEN_KEY = "draxis_token";
const USER_TYPE_KEY = "draxis_user_type";
const ROLE_KEY = "draxis_role";
const ADMIN_KEY = "draxis_admin";
const ACCESS_PROFILE_KEY = "draxis_access_profile";
const ACCESS_EXPIRES_KEY = "draxis_access_expires";

export type UserType = "admin" | "access";
export type AdminRole = "super_admin" | "admin";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export const authStorage = {
  getToken(): string | null {
    if (!isBrowser()) return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  getUserType(): UserType | null {
    if (!isBrowser()) return null;
    const value = localStorage.getItem(USER_TYPE_KEY);
    return value === "admin" || value === "access" ? value : null;
  },

  getRole(): AdminRole | null {
    if (!isBrowser()) return null;
    const value = localStorage.getItem(ROLE_KEY);
    return value === "super_admin" || value === "admin" ? value : null;
  },

  getAdmin(): AdminSession["admin"] | null {
    if (!isBrowser()) return null;
    const raw = localStorage.getItem(ADMIN_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AdminSession["admin"];
    } catch {
      return null;
    }
  },

  getAccessProfile(): AccessSession["profile"] | null {
    if (!isBrowser()) return null;
    const raw = localStorage.getItem(ACCESS_PROFILE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AccessSession["profile"];
    } catch {
      return null;
    }
  },

  getAccessExpiresAt(): string | null {
    if (!isBrowser()) return null;
    return localStorage.getItem(ACCESS_EXPIRES_KEY);
  },

  setAdminSession(session: AdminSession): void {
    if (!isBrowser()) return;
    localStorage.setItem(TOKEN_KEY, session.token);
    localStorage.setItem(USER_TYPE_KEY, "admin");
    localStorage.setItem(ROLE_KEY, session.role);
    localStorage.setItem(ADMIN_KEY, JSON.stringify(session.admin));
    localStorage.removeItem(ACCESS_PROFILE_KEY);
    localStorage.removeItem(ACCESS_EXPIRES_KEY);
  },

  setAccessSession(session: AccessSession): void {
    if (!isBrowser()) return;
    localStorage.setItem(TOKEN_KEY, session.token);
    localStorage.setItem(USER_TYPE_KEY, "access");
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(ADMIN_KEY);
    localStorage.setItem(ACCESS_PROFILE_KEY, JSON.stringify(session.profile));
    localStorage.setItem(ACCESS_EXPIRES_KEY, session.expires_at);
  },

  clear(): void {
    if (!isBrowser()) return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_TYPE_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(ADMIN_KEY);
    localStorage.removeItem(ACCESS_PROFILE_KEY);
    localStorage.removeItem(ACCESS_EXPIRES_KEY);
  },

  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  },

  isAdmin(): boolean {
    return this.getUserType() === "admin";
  },

  isGuest(): boolean {
    return this.getUserType() === "access";
  },

  isSuperAdmin(): boolean {
    return this.getRole() === "super_admin";
  },

  canSeeSalary(): boolean {
    if (this.isAdmin()) return true;
    const profile = this.getAccessProfile();
    return profile?.role_type === "ceo";
  },

  canManageEmployees(): boolean {
    return this.isAdmin();
  },

  canAccessAnalytics(): boolean {
    if (this.isAdmin()) return true;
    return this.getAccessProfile()?.role_type === "ceo";
  },
};

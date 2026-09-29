"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

export interface User {
  id?: number | string;
  name: string;
  email: string;
  role: "admin" | "engineer" | "auditor" | "analyst";
  status: "approved" | "pending" | "rejected";
  initials: string;
  username?: string;
  createdAt?: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  usersList: User[];
  authModalOpen: boolean;
  currentView: "landing" | "app";
  setCurrentView: (view: "landing" | "app") => void;
  openAuthModal: (redirectAction?: () => void) => void;
  closeAuthModal: () => void;
  registerUser: (userData: {
    username: string;
    email: string;
    fullName: string;
    password?: string;
    role?: User["role"];
  }) => Promise<{ success: boolean; status: string; message: string }>;
  login: (userData?: Partial<User> & { password?: string; usernameOrEmail?: string }) => Promise<{ success: boolean; status?: string; message?: string }>;
  logout: () => void;
  requireAuth: (action: () => void) => void;
  approveUser: (userId: number | string) => Promise<void>;
  rejectUser: (userId: number | string) => Promise<void>;
  updateUserRole: (userId: number | string, newRole: User["role"]) => Promise<void>;
}

const initialUsers: User[] = [
  {
    id: 1,
    name: "System Administrator",
    username: "admin",
    email: "admin@pragya.internal",
    role: "admin",
    status: "approved",
    initials: "A",
    createdAt: "2026-09-20",
  },
  {
    id: 2,
    name: "Chinmay",
    username: "chinmay",
    email: "chinmay@enterprise.internal",
    role: "engineer",
    status: "approved",
    initials: "C",
    createdAt: "2026-09-22",
  },
  {
    id: 3,
    name: "Rajesh Patel",
    username: "rajesh",
    email: "rajesh.analyst@enterprise.internal",
    role: "analyst",
    status: "pending",
    initials: "R",
    createdAt: "2026-09-25",
  },
  {
    id: 4,
    name: "Priya Menon",
    username: "priya",
    email: "priya.audit@enterprise.internal",
    role: "auditor",
    status: "pending",
    initials: "P",
    createdAt: "2026-09-25",
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [usersList, setUsersList] = useState<User[]>(initialUsers);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [currentView, setCurrentViewState] = useState<"landing" | "app">("landing");
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // 1. Session Restoration on Initial Load & Page Refresh
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const savedUserStr = localStorage.getItem("pragya_session_user");
      const savedToken = localStorage.getItem("pragya_token");
      const savedView = localStorage.getItem("pragya_current_view");
      const isHashWorkbench = window.location.hash === "#workbench";

      if (savedUserStr && savedToken) {
        const parsedUser: User = JSON.parse(savedUserStr);
        if (parsedUser && parsedUser.username) {
          setUser(parsedUser);
          setIsLoggedIn(true);

          if (savedView === "app" || isHashWorkbench) {
            setCurrentViewState("app");
            if (!isHashWorkbench) {
              window.history.replaceState({ view: "app" }, "", "#workbench");
            }
          }
        }

        // Validate token with live backend /api/auth/me
        fetch("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${savedToken}` },
        })
          .then((res) => {
            if (res.ok) return res.json();
            if (res.status === 401 || res.status === 403) {
              throw new Error("Session expired");
            }
            return null;
          })
          .then((json) => {
            if (json?.data?.user) {
              const u = json.data.user;
              if (u.status === "rejected" || u.status === "pending") {
                // Account revoked or set back to pending
                logout();
                return;
              }
              const freshUser: User = {
                id: u.id,
                name: u.fullName || u.username,
                username: u.username,
                email: u.email,
                role: u.role || "engineer",
                status: u.status || "approved",
                initials: (u.fullName || u.username || "U").charAt(0).toUpperCase(),
              };
              setUser(freshUser);
              localStorage.setItem("pragya_session_user", JSON.stringify(freshUser));
            }
          })
          .catch((err) => {
            if (err.message === "Session expired") {
              logout();
            }
          });
      }
    } catch (e) {
      console.warn("[Auth] Failed to restore session:", e);
    }
  }, []);

  // 2. Load cached users list and synchronize with backend
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("pragya_users_cache");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setUsersList(parsed);
          }
        }
      } catch (e) {}
    }

    const fetchLiveUsers = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/users");
        if (res.ok) {
          const json = await res.json();
          if (json.data?.users && Array.isArray(json.data.users)) {
            const mapped: User[] = json.data.users.map((u: any) => ({
              id: u.id,
              name: u.full_name || u.fullName || u.username,
              username: u.username,
              email: u.email,
              role: u.role || "engineer",
              status: u.status || "approved",
              initials: (u.full_name || u.username || "U").charAt(0).toUpperCase(),
              createdAt: (u.created_at || new Date().toISOString()).split("T")[0],
            }));
            setUsersList(mapped);
            if (typeof window !== "undefined") {
              localStorage.setItem("pragya_users_cache", JSON.stringify(mapped));
            }
          }
        }
      } catch (err) {
        console.log("[Auth] Loaded offline user store");
      }
    };

    fetchLiveUsers();
  }, []);

  // 3. Browser Back/Forward history navigation handling
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window === "undefined") return;
      if (window.location.hash === "#workbench") {
        setCurrentViewState("app");
        localStorage.setItem("pragya_current_view", "app");
      } else {
        setCurrentViewState("landing");
        localStorage.setItem("pragya_current_view", "landing");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const setCurrentView = (view: "landing" | "app") => {
    setCurrentViewState(view);
    if (typeof window !== "undefined") {
      localStorage.setItem("pragya_current_view", view);
      if (view === "app") {
        if (window.location.hash !== "#workbench") {
          window.history.pushState({ view: "app" }, "", "#workbench");
        }
      } else {
        if (window.location.hash === "#workbench") {
          window.history.pushState({ view: "landing" }, "", window.location.pathname);
        }
      }
    }
  };

  const openAuthModal = (redirectAction?: () => void) => {
    if (redirectAction) {
      setPendingAction(() => redirectAction);
    } else {
      setPendingAction(null);
    }
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
    setPendingAction(null);
  };

  // Register User (Always starts in 'pending' status awaiting Admin Approval)
  const registerUser = async (userData: {
    username: string;
    email: string;
    fullName: string;
    password?: string;
    role?: User["role"];
  }): Promise<{ success: boolean; status: string; message: string }> => {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: userData.fullName,
      username: userData.username.toLowerCase(),
      email: userData.email.toLowerCase(),
      role: userData.role || "engineer",
      status: "pending", // STRICTLY PENDING
      initials: userData.fullName.charAt(0).toUpperCase() || "U",
      createdAt: new Date().toISOString().split("T")[0],
    };

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: userData.username,
          email: userData.email,
          fullName: userData.fullName,
          password: userData.password,
          role: userData.role || "engineer",
          authProvider: "local",
        }),
      });

      const data = await res.json();
      if (data.data?.user?.id) {
        newUser.id = data.data.user.id;
      }
    } catch (err) {
      console.log("[Auth] Registered into local user store (pending approval)");
    }

    setUsersList((prev) => {
      const updated = [newUser, ...prev.filter((u) => u.username !== newUser.username && u.email !== newUser.email)];
      if (typeof window !== "undefined") {
        localStorage.setItem("pragya_users_cache", JSON.stringify(updated));
      }
      return updated;
    });

    return {
      success: true,
      status: "pending",
      message: "Account registered successfully! Your account is currently in 'Pending Admin Approval' state. An administrator must approve your account in User Management before you can sign in.",
    };
  };

  const login = async (
    userData?: Partial<User> & { password?: string; usernameOrEmail?: string }
  ): Promise<{ success: boolean; status?: string; message?: string }> => {
    const usernameOrEmail = (userData?.usernameOrEmail || userData?.email || userData?.username || "").trim();
    const password = userData?.password || "";

    if (!usernameOrEmail) {
      return { success: false, message: "Username or email is required." };
    }

    if (!password) {
      return { success: false, message: "Password is required." };
    }

    // Authenticate with backend API (Verifies password hash against MySQL / users.json)
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usernameOrEmail,
          password,
        }),
      });

      const data = await res.json();

      if (res.status === 403 && data.status === "pending") {
        return {
          success: false,
          status: "pending",
          message: data.message || "Access Denied: Your account is awaiting Administrator Permission.",
        };
      }

      if (res.status === 403 && data.status === "rejected") {
        return {
          success: false,
          status: "rejected",
          message: data.message || "Access Denied: Your account was rejected by the administrator.",
        };
      }

      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.message || "Invalid credentials. Incorrect password.",
        };
      }

      if (res.ok && data.success && data.data?.user) {
        const dbUser = data.data.user;

        if (dbUser.status === "pending") {
          return {
            success: false,
            status: "pending",
            message: "Access Denied: Your account is awaiting Administrator Permission.",
          };
        }
        if (dbUser.status === "rejected") {
          return {
            success: false,
            status: "rejected",
            message: "Access Denied: Your account was rejected by the administrator.",
          };
        }

        const loggedUser: User = {
          id: dbUser.id,
          name: dbUser.fullName || dbUser.username,
          username: dbUser.username,
          email: dbUser.email,
          role: dbUser.role || "engineer",
          status: dbUser.status || "approved",
          initials: (dbUser.fullName || dbUser.username).charAt(0).toUpperCase() || "U",
        };

        if (typeof window !== "undefined") {
          if (data.data.token) {
            localStorage.setItem("pragya_token", data.data.token);
          }
          localStorage.setItem("pragya_session_user", JSON.stringify(loggedUser));
          localStorage.setItem("pragya_current_view", "app");
        }

        setUser(loggedUser);
        setIsLoggedIn(true);
        setAuthModalOpen(false);
        setCurrentView("app");

        if (pendingAction) {
          const action = pendingAction;
          setPendingAction(null);
          setTimeout(action, 150);
        }

        return { success: true };
      }
    } catch (err: any) {
      console.warn("[Auth] Backend unreachable, checking offline store:", err);
    }

    return {
      success: false,
      message: "Unable to verify credentials. Authentication server unreachable or invalid credentials.",
    };
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setPendingAction(null);
    setCurrentViewState("landing");
    if (typeof window !== "undefined") {
      localStorage.removeItem("pragya_token");
      localStorage.removeItem("pragya_session_user");
      localStorage.removeItem("pragya_current_view");
      if (window.location.hash === "#workbench") {
        window.history.replaceState(null, "", window.location.pathname);
      }
    }
  };

  const requireAuth = (action: () => void) => {
    if (isLoggedIn) {
      action();
    } else {
      openAuthModal(action);
    }
  };

  // Admin Approve User
  const approveUser = async (userId: number | string) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("pragya_token") : null;
      await fetch(`http://localhost:5000/api/auth/users/${userId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: "approved" }),
      });
    } catch (err) {}

    setUsersList((prev) => {
      const updated = prev.map((u) => (String(u.id) === String(userId) ? { ...u, status: "approved" as const } : u));
      if (typeof window !== "undefined") {
        localStorage.setItem("pragya_users_cache", JSON.stringify(updated));
      }
      return updated;
    });
  };

  // Admin Reject User
  const rejectUser = async (userId: number | string) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("pragya_token") : null;
      await fetch(`http://localhost:5000/api/auth/users/${userId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: "rejected" }),
      });
    } catch (err) {}

    setUsersList((prev) => {
      const updated = prev.map((u) => (String(u.id) === String(userId) ? { ...u, status: "rejected" as const } : u));
      if (typeof window !== "undefined") {
        localStorage.setItem("pragya_users_cache", JSON.stringify(updated));
      }
      return updated;
    });
  };

  // Admin Update Role
  const updateUserRole = async (userId: number | string, newRole: User["role"]) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("pragya_token") : null;
      await fetch(`http://localhost:5000/api/auth/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ role: newRole }),
      });
    } catch (err) {}

    setUsersList((prev) => {
      const updated = prev.map((u) => (String(u.id) === String(userId) ? { ...u, role: newRole } : u));
      if (typeof window !== "undefined") {
        localStorage.setItem("pragya_users_cache", JSON.stringify(updated));
      }
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        usersList,
        authModalOpen,
        currentView,
        setCurrentView,
        openAuthModal,
        closeAuthModal,
        registerUser,
        login,
        logout,
        requireAuth,
        approveUser,
        rejectUser,
        updateUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

"use client";

import React, { useState } from "react";
import {
  X,
  Lock,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  UserCog,
} from "lucide-react";
import { TempleLogo } from "./TempleLogo";
import { useAuth } from "@/context/AuthContext";

export function AuthModal() {
  const { authModalOpen, closeAuthModal, login, registerUser } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);

  // Form Fields - strictly start empty with no pre-existing data
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPendingBlocked, setIsPendingBlocked] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Clear fields whenever modal opens or closes
  React.useEffect(() => {
    if (authModalOpen) {
      setUsername("");
      setEmail("");
      setFullName("");
      setPassword("");
      setErrorMessage("");
      setIsPendingBlocked(false);
      setSuccessMessage("");
    }
  }, [authModalOpen]);

  if (!authModalOpen) return null;

  const resetForm = () => {
    setUsername("");
    setEmail("");
    setFullName("");
    setPassword("");
    setErrorMessage("");
    setIsPendingBlocked(false);
    setSuccessMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setIsPendingBlocked(false);
    setSuccessMessage("");

    try {
      if (isSignUp) {
        // Sign Up with strict Pending status
        const result = await registerUser({
          username: username.trim(),
          email: email.trim(),
          fullName: fullName.trim(),
          password,
          role: "engineer",
        });

        setSuccessMessage(result.message);
        setIsSignUp(false);
        setPassword("");
      } else {
        // Sign In
        const result = await login({
          usernameOrEmail: username.trim(),
          password,
        });

        if (!result.success) {
          if (result.status === "pending") {
            setIsPendingBlocked(true);
            setErrorMessage(
              result.message ||
                "Access Denied: Your account is awaiting Administrator Permission."
            );
          } else if (result.status === "rejected") {
            setErrorMessage(result.message || "Access Denied: Your account was rejected by the administrator.");
          } else {
            setErrorMessage(result.message || "Invalid username or password.");
          }
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-[#FFFFFF] border border-[#E5DDD2] rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-1.5 rounded-full text-[#8C8276] hover:text-[#1F1D1A] hover:bg-[#F4ECE2] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center space-x-3 mb-5">
          <div className="text-[#5C2817]">
            <TempleLogo size={28} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#1C1917]">
              {isSignUp ? "Register for Pragya AI" : "Sign In to Pragya AI"}
            </h3>
            <p className="text-xs text-[#7A7166]">
              {isSignUp ? "Requires Administrator Permission" : "Air-Gapped Sovereign Access Gate"}
            </p>
          </div>
        </div>

        {/* Pending Permission Warning Banner */}
        {isPendingBlocked && (
          <div className="mb-4 p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-1.5 animate-fadeIn">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <ShieldAlert className="w-4 h-4 text-amber-800 shrink-0" />
              <span>Permission Pending Approval</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-800">
              Your account has been registered, but an <strong>Administrator must approve your access</strong> before you can use the workbench.
            </p>
          </div>
        )}

        {/* Feedback Messages */}
        {errorMessage && !isPendingBlocked && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Registration Submitted</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">{successMessage}</p>
          </div>
        )}

        {/* Sign In vs Sign Up Tabs */}
        <div className="grid grid-cols-2 gap-1 bg-[#FAF6F0] p-1 rounded-xl border border-[#E8DFD3] mb-4">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              resetForm();
            }}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
              !isSignUp ? "bg-white text-[#5C2817] shadow-sm" : "text-[#766D63] hover:text-[#1F1D1A]"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true);
              resetForm();
            }}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
              isSignUp ? "bg-white text-[#5C2817] shadow-sm" : "text-[#766D63] hover:text-[#1F1D1A]"
            }`}
          >
            Sign Up / Request Access
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3" autoComplete="off">
          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-[#484139] mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E2D8CC] rounded-xl px-3.5 py-2.5 text-xs text-[#1F1D1A] focus:outline-none focus:border-[#5C2817]"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#484139] mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#E2D8CC] rounded-xl px-3.5 py-2.5 text-xs text-[#1F1D1A] focus:outline-none focus:border-[#5C2817]"
              required
            />
          </div>

          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-[#484139] mb-1">
                Corporate Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E2D8CC] rounded-xl px-3.5 py-2.5 text-xs text-[#1F1D1A] focus:outline-none focus:border-[#5C2817]"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#484139] mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E2D8CC] rounded-xl px-3.5 py-2.5 text-xs text-[#1F1D1A] focus:outline-none focus:border-[#5C2817]"
                required
              />
              <Lock className="w-4 h-4 text-[#8C8276] absolute right-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#5C2817] hover:bg-[#471E11] text-white py-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.99] mt-2"
          >
            {loading ? (
              <span>Verifying permissions...</span>
            ) : isSignUp ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Submit Access Request</span>
              </>
            ) : (
              <>
                <span>Sign In & Enter Workbench</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-4 text-center text-[11px] text-[#8C8379] flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#5C2817]" />
          <span>Role-Based Access Control · Admin Permission Required</span>
        </div>
      </div>
    </div>
  );
}

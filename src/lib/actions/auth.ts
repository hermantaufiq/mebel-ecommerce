"use server";

// TODO(Tahap 5): Ganti sistem auth manual ini dengan NextAuth.js/Lucia yang proper.
// Jangan biarkan dua sistem auth berjalan bersamaan saat migrasi nanti.

import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  tier: string;
  loyaltyPoints: number;
  addresses?: any[];
}

/**
 * Server Action for authenticating users.
 * Validates against database with bcrypt password comparison.
 * Generic error message prevents user enumeration attacks.
 */
export async function loginAction(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; user?: AuthUser }> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      return { success: false, error: "Email atau kata sandi salah" };
    }

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: { addresses: true },
    });

    if (!user || !user.passwordHash) {
      return { success: false, error: "Email atau kata sandi salah" };
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return { success: false, error: "Email atau kata sandi salah" };
    }

    // Set secure HttpOnly session cookie
    cookies().set("ml_user_id", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        tier: user.tier,
        loyaltyPoints: user.loyaltyPoints,
        addresses: user.addresses,
      },
    };
  } catch (err: any) {
    console.error("loginAction error:", err);
    return { success: false, error: "Terjadi kesalahan pada sistem autentikasi" };
  }
}

/**
 * Server Action for registering new users.
 */
export async function registerAction(
  name: string,
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; user?: AuthUser }> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    if (!name.trim() || !cleanEmail || !password || password.length < 6) {
      return {
        success: false,
        error: "Harap isi nama, email valid, dan kata sandi minimal 6 karakter",
      };
    }

    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return { success: false, error: "Email ini sudah terdaftar di sistem kami" };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        tier: "Regular",
        loyaltyPoints: 0,
      },
      include: { addresses: true },
    });

    // Set secure HttpOnly session cookie
    cookies().set("ml_user_id", newUser.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return {
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        tier: newUser.tier,
        loyaltyPoints: newUser.loyaltyPoints,
        addresses: newUser.addresses,
      },
    };
  } catch (err: any) {
    console.error("registerAction error:", err);
    return { success: false, error: "Gagal mendaftarkan akun baru" };
  }
}

/**
 * Server Action for logging out. Clears the session cookie.
 */
export async function logoutAction(): Promise<{ success: boolean }> {
  try {
    cookies().delete("ml_user_id");
    return { success: true };
  } catch (err: any) {
    console.error("logoutAction error:", err);
    return { success: false };
  }
}

/**
 * Server Action to get the currently logged in user profile with addresses.
 */
export async function getCurrentUserAction(): Promise<AuthUser | null> {
  try {
    const userId = cookies().get("ml_user_id")?.value;
    if (!userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: {
          orderBy: { isDefault: "desc" },
        },
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      tier: user.tier,
      loyaltyPoints: user.loyaltyPoints,
      addresses: user.addresses,
    };
  } catch (err: any) {
    console.error("getCurrentUserAction error:", err);
    return null;
  }
}

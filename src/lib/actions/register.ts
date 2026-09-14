"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

const registerSchema = z.object({
  name: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  email: z.string().email("Format alamat email tidak valid"),
  password: z.string().min(8, "Kata sandi minimal 8 karakter"),
});

export interface RegisterResult {
  success: boolean;
  error?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

/**
 * Server Action to register a new user with bcrypt password hashing.
 * Validates using Zod: email format, min 8 char password.
 */
export async function registerAction(
  name: string,
  email: string,
  password: string
): Promise<RegisterResult> {
  try {
    const validated = registerSchema.safeParse({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    });

    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "Data pendaftaran tidak valid",
      };
    }

    const cleanEmail = validated.data.email;
    const cleanName = validated.data.name;

    // Check if email already registered
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true },
    });

    if (existingUser) {
      return {
        success: false,
        error: "Email ini sudah terdaftar di sistem kami. Silakan masuk.",
      };
    }

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        passwordHash,
        tier: "Regular",
        role: "user",
        loyaltyPoints: 0,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return {
      success: true,
      user: newUser,
    };
  } catch (err: any) {
    console.error("registerAction error:", err);
    return {
      success: false,
      error: "Terjadi kesalahan saat membuat akun. Silakan coba lagi.",
    };
  }
}

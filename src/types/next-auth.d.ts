import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id?: string;
    role?: string;
    tier?: string;
    loyaltyPoints?: number;
  }

  interface Session {
    user: {
      id: string;
      role?: string;
      tier?: string;
      loyaltyPoints?: number;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    tier?: string;
    loyaltyPoints?: number;
  }
}

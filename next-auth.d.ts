import { type JWT } from "next-auth/jwt";
import { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: "admin" | "member";
    };
  }

  interface User {
    id: string;
    role: "admin" | "member";
    name: string;
    email: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "admin" | "member";
    full_name: string;
    email: string;
  }
}

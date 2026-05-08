import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { db, users } from "@/lib/db";
import { registerRequestSchema } from "@/lib/validations";
import { eq, or } from "drizzle-orm";

export async function POST(request: Request) {
  const body = await request.json();

  const parseResult = registerRequestSchema.safeParse(body);

  if (!parseResult.success) {
    return NextResponse.json({ message: parseResult.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const registration = parseResult.data;

  const existingUser = await db
    .select({ id: users.id })
    .from(users)
    .where(or(eq(users.email, registration.email), eq(users.member_id, registration.member_id)))
    .limit(1)
    .then((results) => results[0]);

  if (existingUser) {
    return NextResponse.json({ message: "Email or member ID already registered" }, { status: 409 });
  }

  const passwordHash = await hash(registration.password, 10);

  await db.insert(users).values({
    full_name: registration.full_name,
    email: registration.email,
    phone: registration.phone,
    member_id: registration.member_id,
    password_hash: passwordHash,
    role: "member",
    is_approved: false,
  });

  return NextResponse.json({ message: "Registration submitted. Await admin approval." }, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key_12345";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find the user by email
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check if the account is active
    if (user.status !== "active") {
      return NextResponse.json(
        { error: "Account is inactive or suspended" },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // In production, we'd log login_attempts here
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Get the employee data to have the full name / details in token
    const employee = await prisma.employees.findFirst({
      where: { email: user.email }
    });

    // Create JWT Token
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: employee ? `${employee.first_name} ${employee.last_name}` : user.name,
      employee_id: employee?.id || null
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "24h" });

    // Set cookie
    const response = NextResponse.json({
      success: true,
      user: tokenPayload,
      redirect: user.role === "admin" ? "/admin" : user.role === "manager" ? "/manager" : "/employee"
    });

    response.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

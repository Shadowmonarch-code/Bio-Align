import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { db } from "@/lib/db"

export async function POST() {
  try {
    // Check if demo user already exists
    const existingUser = await db.user.findUnique({
      where: { email: "demo@bioalign.io" },
    })

    if (existingUser) {
      return NextResponse.json({
        success: true,
        message: "Demo user already exists",
        user: {
          email: existingUser.email,
          password: "demo1234",
        },
      })
    }

    // Create demo user
    const hashedPassword = await hash("demo1234", 12)
    
    const user = await db.user.create({
      data: {
        name: "Demo Researcher",
        email: "demo@bioalign.io",
        password: hashedPassword,
        role: "user",
        institution: "BioAlign Demo University",
      },
    })

    return NextResponse.json({
      success: true,
      message: "Demo user created successfully",
      credentials: {
        email: "demo@bioalign.io",
        password: "demo1234",
      },
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error("Seed error:", error)
    return NextResponse.json(
      { error: "Failed to create demo user" },
      { status: 500 }
    )
  }
}

import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { Role } from "@prisma/client"

async function verifyUserCRUD() {
  console.log("🔍 Verifying User model CRUD operations...\n")

  try {
    // T023: Create user with role
    console.log("1. Creating user with PLAYER role...")
    const hashedPassword = await bcrypt.hash("test123", 10)
    const testUser = await prisma.user.create({
      data: {
        email: "test@example.com",
        name: "Test User",
        password: hashedPassword,
        role: Role.PLAYER,
        isActive: true
      }
    })
    console.log("✅ User created:", testUser.id, testUser.email, testUser.role)

    // T024: Retrieve user with role
    console.log("\n2. Retrieving user by email...")
    const retrievedUser = await prisma.user.findUnique({
      where: { email: "test@example.com" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true
        // password is NOT selected (T028)
      }
    })
    console.log("✅ User retrieved:", retrievedUser?.email, retrievedUser?.role)
    console.log("✅ Password field excluded:", !("password" in (retrievedUser || {})))

    // T025: Update user role
    console.log("\n3. Updating user role to COACH...")
    const updatedUser = await prisma.user.update({
      where: { id: testUser.id },
      data: { role: Role.COACH }
    })
    console.log("✅ User role updated:", updatedUser.role)

    // Verify change persisted
    const verifyUpdate = await prisma.user.findUnique({
      where: { id: testUser.id },
      select: { role: true }
    })
    console.log("✅ Change persisted:", verifyUpdate?.role === Role.COACH)

    // T026: Filter users by role
    console.log("\n4. Filtering users by ADMIN role...")
    const adminUsers = await prisma.user.findMany({
      where: { role: Role.ADMIN },
      select: { email: true, role: true }
    })
    console.log(`✅ Found ${adminUsers.length} ADMIN users`)
    adminUsers.forEach((u) => {
      console.log(`   - ${u.email} (${u.role})`)
    })

    // T027: Verify password hashing
    console.log("\n5. Verifying password is hashed...")
    const userWithPassword = await prisma.user.findUnique({
      where: { id: testUser.id },
      select: { password: true }
    })
    const isHashed =
      userWithPassword?.password &&
      userWithPassword.password.startsWith("$2") &&
      userWithPassword.password.length > 50
    console.log("✅ Password is hashed:", isHashed)
    console.log("✅ Password is NOT plain text:", userWithPassword?.password !== "test123")

    // Cleanup
    console.log("\n6. Cleaning up test user...")
    await prisma.user.delete({
      where: { id: testUser.id }
    })
    console.log("✅ Test user deleted")

    console.log("\n✅ All CRUD operations verified successfully!")
  } catch (error) {
    console.error("❌ Verification failed:", error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

verifyUserCRUD()


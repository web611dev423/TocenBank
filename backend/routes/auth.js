import express from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import crypto from "crypto"
import pool from "../db/index.js"
import twilio from "twilio"

// const twilioClient = twilio.

const router = express.Router()

// Register a new user
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, phoneNumber, verificationCode } = req.body

    console.log(req.body)

    // Check if user already exists
    const userCheck = await pool.query("SELECT * FROM users WHERE email = $1 OR username = $2", [email, username])

    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Verify phone number
    const verificationResult = await pool.query(
      "SELECT * FROM verification_codes WHERE phone_number = $1 AND code = $2 AND expires_at > NOW()",
      [phoneNumber, verificationCode],
    )

    if (verificationResult.rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired verification code" })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create new user
    const newUser = await pool.query(
      "INSERT INTO users (username, email, password, phone_number, is_phone_verified) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, phone_number, is_phone_verified",
      [username, email, hashedPassword, phoneNumber, true],
    )

    // Delete used verification code
    await pool.query("DELETE FROM verification_codes WHERE phone_number = $1 AND code = $2", [
      phoneNumber,
      verificationCode,
    ])

    res.status(200).json({
      message: "User registered successfully",
      user: newUser.rows[0],
      status: 200
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Check if user exists
    const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email])

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const user = userResult.rows[0]

    // Check if password is correct
    if (user.auth_provider !== "local") {
      return res.status(401).json({
        message: `This account uses ${user.auth_provider} authentication. Please sign in with ${user.auth_provider}.`,
      })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Create and assign token
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" })

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phoneNumber: user.phone_number,
        isPhoneVerified: user.is_phone_verified,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Send verification code
router.post("/send-verification", async (req, res) => {
  try {

    console.log(req.body)
    const { phoneNumber } = req.body

    // Generate a random 6-digit code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

    console.log(verificationCode)

    // Set expiration time (10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    // Store the code in the database
    await pool.query("INSERT INTO verification_codes (phone_number, code, expires_at) VALUES ($1, $2, $3)", [
      phoneNumber,
      verificationCode,
      expiresAt,
    ])

    // try {
    //   await twilioClient.messages.create({
    //     body: `Your verification code is: ${verificationCode}`,
    //     from: process.env.TWILIO_PHONE_NUMBER,
    //     to: phoneNumber
    //   });
      
    //   res.json({ success: true });
    // } catch (error) {
    //   console.error('SMS sending failed:', error);
    //   res.status(500).json({ error: 'Failed to send verification code' });
    // }

    // Send SMS with the code
    // await sendSMS(phoneNumber, `Your verification code is: ${verificationCode}. It will expire in 10 minutes.`)

    res.status(200).json({ message: "Verification code sent successfully", status: 200 })
  } catch (error) {
    console.error("Send verification error:", error)
    res.status(500).json({ message: "Failed to send verification code" })
  }
})



// Forgot password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body

    // Check if user exists
    const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email])

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Store token in database
    await pool.query("UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3", [
      resetToken,
      resetTokenExpiry,
      email,
    ])

    // In a real application, you would send an email with the reset link
    // For this example, we'll just return the token
    const resetLink = `http://localhost:3001/reset-password?token=${resetToken}`
    console.log("Password reset link:", resetLink)

    res.status(200).json({
      message: "Password reset link sent to your email",
      // Only for development
      resetLink,
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Reset password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body

    // Find user with valid reset token
    const userResult = await pool.query("SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()", [
      token,
    ])

    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired reset token" })
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Update user password and clear reset token
    await pool.query(
      "UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE reset_token = $2",
      [hashedPassword, token],
    )

    res.status(200).json({ message: "Password reset successful" })
  } catch (error) {
    console.error("Reset password error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Logout
router.post("/logout", (req, res) => {
  res.clearCookie("token")
  res.status(200).json({ message: "Logged out successfully" })
})

// Google OAuth routes
router.get("/google", (req, res) => {
  // In a real application, redirect to Google OAuth
  res.status(501).json({ message: "Google OAuth not implemented in this example" })
})

// Apple OAuth routes
router.get("/apple", (req, res) => {
  // In a real application, redirect to Apple OAuth
  res.status(501).json({ message: "Apple OAuth not implemented in this example" })
})

export default router


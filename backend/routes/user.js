import express from "express"
import pool from "../db/index.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()

// Get user profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id

    const userResult = await pool.query(
      "SELECT id, username, email, phone_number, is_phone_verified FROM users WHERE id = $1",
      [userId],
    )

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" })
    }

    const user = userResult.rows[0]

    res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phoneNumber: user.phone_number,
        isPhoneVerified: user.is_phone_verified,
      },
    })
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update user profile
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const { username, email, phoneNumber } = req.body

    // Check if username or email already exists
    if (username || email) {
      const checkResult = await pool.query("SELECT * FROM users WHERE (username = $1 OR email = $2) AND id != $3", [
        username,
        email,
        userId,
      ])

      if (checkResult.rows.length > 0) {
        return res.status(400).json({ message: "Username or email already in use" })
      }
    }

    // Update user
    const updateFields = []
    const values = []
    let valueIndex = 1

    if (username) {
      updateFields.push(`username = $${valueIndex}`)
      values.push(username)
      valueIndex++
    }

    if (email) {
      updateFields.push(`email = $${valueIndex}`)
      values.push(email)
      valueIndex++
    }

    if (phoneNumber) {
      updateFields.push(`phone_number = $${valueIndex}`)
      values.push(phoneNumber)
      valueIndex++
    }

    // Add updated_at
    updateFields.push(`updated_at = NOW()`)

    if (updateFields.length === 0) {
      return res.status(400).json({ message: "No fields to update" })
    }

    values.push(userId)
    const query = `
      UPDATE users 
      SET ${updateFields.join(", ")} 
      WHERE id = $${valueIndex} 
      RETURNING id, username, email, phone_number, is_phone_verified
    `

    const result = await pool.query(query, values)
    const updatedUser = result.rows[0]

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        phoneNumber: updatedUser.phone_number,
        isPhoneVerified: updatedUser.is_phone_verified,
      },
    })
  } catch (error) {
    console.error("Update profile error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

export default router


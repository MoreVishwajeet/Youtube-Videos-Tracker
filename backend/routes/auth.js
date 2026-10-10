const express = require("express");
const db = require("../database/database");
const {
  hashPassword,
  comparePassword,
  generateToken
} = require("../services/auth");
const authenticateToken = require("../middleware/auth");


const router = express.Router();

router.get("/me", authenticateToken, (req, res) => {
  const user = db
    .prepare(`
      SELECT id, name, email, created_at
      FROM users
      WHERE id = ?
    `)
    .get(req.user.userId);

  if (!user) {
    return res.status(404).json({
      error: "User not found"
    });
  }

  res.json({
    user
  });
});

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      error: "Name, email and password are required"
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      error: "Password must be at least 6 characters"
    });
  }

  try {
    const existingUser = db
      .prepare("SELECT id FROM users WHERE email = ?")
      .get(email);

    if (existingUser) {
      return res.status(409).json({
        error: "Email already registered"
      });
    }

    const passwordHash = await hashPassword(password);

    const result = db
      .prepare(`
        INSERT INTO users (name, email, password_hash)
        VALUES (?, ?, ?)
      `)
      .run(name, email, passwordHash);

    res.status(201).json({
      message: "User registered successfully",
      userId: result.lastInsertRowid
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to register user"
    });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "Email and password are required"
    });
  }

  try {
    const user = db
      .prepare(`
        SELECT id, name, email, password_hash
        FROM users
        WHERE email = ?
      `)
      .get(email);

    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password"
      });
    }

    const passwordValid = await comparePassword(
      password,
      user.password_hash
    );

    if (!passwordValid) {
      return res.status(401).json({
        error: "Invalid email or password"
      });
    }

    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to login"
    });
  }
});

module.exports = router;
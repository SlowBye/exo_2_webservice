import express from "express";
import { supabase } from '../supabaseClient.js';
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const router = express.Router();

const JWT_SECRET = "inspi_max";
const saltRounds = 10;

/**
 * @swagger
 * /api/login:
 *   get:
 *     summary: Connect
 *     description: Authenticate user using HTTP Basic Auth and return a JWT token.
 *     security:
 *       - basicAuth: []
 *     responses:
 *       200:
 *         description: Successful login, returns JWT token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token.
 *       401:
 *         description: Unauthorized - Missing or invalid credentials.
 */
router.get("/login", async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return res.status(401).json({
      error:
        "Missing or invalid Authorization header. Expected 'Basic <base64(username:password)>'",
    });
  }

  const base64Auth = authHeader.split(" ")[1];
  const stringAuth = Buffer.from(base64Auth, "base64").toString("utf-8");
  const [username, password] = stringAuth.split(":");

  if (!username || !password) {
    return res.status(401).json({ error: "username or password missing" });
  }

  const { data, error } = await supabase
    .from("user")
    .select("login, password")
    .eq("login", username)
    .single();

  if (error || !data) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const ok = await bcrypt.compare(password, data.password);
  if (!ok) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });
  return res.json({ token });
});

router.post("/sign_up", async (req, res) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({ error: "login and password are required" });
    }

    const { data: existing } = await supabase
      .from("user")
      .select("id")
      .eq("login", login)
      .single();

    if (existing) {
      return res.status(409).json({ error: "login already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const { error: insertError } = await supabase
      .from("user")
      .insert({
        login,
        password: hashedPassword,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      return res.status(500).json({ error: insertError.message });
    }

    return res.status(201).json({
      message: "User signed up successfully",
    });
  } catch (err) {
    console.error("Sign-up error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
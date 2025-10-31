import express from "express";
import { supabase } from '../supabaseClient.js';
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const router = express.Router();

const JWT_SECRET = "inspi_max";
const saltRounds = 10;

router.get("/login", async (req, res) => {
    const authHeader = req.headers.authorization;
    const base64Auth = authHeader.split(" ")[1];
    const stringAuth = Buffer.from(base64Auth, "base64").toString("utf-8");

    let [username, password] = stringAuth.split(":");

    const { data, error } = await supabase
        .from('user')
        .select('login, password')
        .eq('login', username)
        .single()

    const ok = await bcrypt.compare(password, data.password);
    if (!ok) return res.status(401).json({ error: "Unauthorized v1" });

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    if (username === data.login && ok) {
        const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });
        res.json({ token });
    } else {
        res.status(401).json({ error: "Unauthorized" });
    }
});

router.post("/sign_up", async (req, res) => {
  try {
    const { login, password } = req.body;
    if (!login || !password) {
      return res.status(400).json({ error: "login and password are required" });
    }
    const { data: existing} = await supabase
      .from("user")
      .select("id")
      .eq("login", login)
      .single();

    if (existing) {
      return res.status(409).json({ error: "login already registered" });
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const { data, error: insertError } = await supabase
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
      user: {
        id: data.id,
        login: data.login,
        password_hashed: data.password, 
        created_at: data.created_at
      }
    });
  } catch (err) {
    console.error("Sign-up error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
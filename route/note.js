import express from "express";
import { supabase } from "../supabaseClient.js";
import token_auth from "../middleware/auth.js"

const router = express.Router();

router.get("/notes",token_auth, async (req, res) => {
  let query = supabase.from("notes").select("*");
  const { data, error } = await query;
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  const notes = data;
  return res.status(200).json(notes);
});

router.post("/notes",token_auth, async (req, res) => {
  const body = {
    title: req.body.title,
    content: req.body.content,
    created_at: new Date().toISOString(),
  };

  if (!body.title) {
    return res.status(400).json({ error: "Title is required" });
  }
  if (!body.content) {
    return res.status(400).json({ error: "Content is required" });
  }
  const { data, error } = await supabase.from("notes").insert(body);
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  return res.status(201).json("Parfait chef !!!");
});

router.put("/notes/:id",token_auth, async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("notes")
    .update({ content: req.body.content, title: req.body.title })
    .eq("id", id)
    .select("id");

  if (error) return res.status(500).json({ error: error.message });
  if (!data || data.length === 0) return res.status(404).json({ error: "Note not found" });

  return res.status(200).json("Belle modification chef!!!!");
});

router.get("/notes/:id",token_auth, async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("id", id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  return res.status(200).json(data);
});

router.delete("/notes/:id",token_auth, async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
                                .from("notes")
                                .delete()
                                .eq("id", id)
                                .select("id")
  
  if (!data || data.length === 0) return res.status(404).json({ error: "n'existe pas chef!!!!" });

  if (error) {
   return  res.status(500).json({ error: error.message });
  }
  return res.status(200).json("Bien jouer tu a supprimer l'evenement");
});

export default router;
import express from "express";
import { supabase } from "../supabaseClient.js";
import token_auth from "../middleware/auth.js";
import {NoteCreateDto} from "./note.dto.js";

const router = express.Router();

router.get("/notes", token_auth, async (req, res) => {
    /**
     * @swagger
     * /soleil/notes:
     *   get:
     *     summary: AllNotes
     *     description: Retrieve a list of all notes from the database.
     *     security:
     *       - tokenAuth: []
     *     responses:
     *       200:
     *         description: A list of notes.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/NoteDto'
     *       401:
     *         description: Unauthorized - Missing or invalid token.
     */

    let query = supabase.from("notes").select("*");
    const { data, error } = await query;
    if (error) {
        return res.status(500).json({ error: error.message });
    }
    const notes = data;
    return res.status(200).json(notes);
});

router.post("/notes", token_auth, async (req, res) => {
    /**
     * @swagger
     * /soleil/notes:
     *   post:
     *     summary: Create
     *     description: Add a new note to the database.
     *     security:
     *       - tokenAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/NoteCreateDto'
     *     responses:
     *       201:
     *         description: Note created
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/NoteDto'
     *       400:
     *         description: Missing title or content
     *       401:
     *         description: Unauthorized - Missing or invalid token.
     */

    const dto = new NoteCreateDto(req.body);

    const { valid, errors } = dto.validate();
    if (!valid) {
        return res.status(400).json({ errors });
    }

    const body = {
        ...dto.toObject(),
        created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
        .from("notes")
        .insert(body)
        .select("id, title, content, created_at")
        .single();

    if (error) {
        return res.status(500).json({ error: error.message });
    }
    return res.status(201).json(data);
});

router.put("/notes/:id", token_auth, async (req, res) => {
    /**
     * @swagger
     * /soleil/notes/{id}:
     *   put:
     *     summary: Update
     *     description: Update an existing note in the database.
     *     security:
     *       - tokenAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: The note ID.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/NoteCreateDto'
     *     responses:
     *       200:
     *         description: Note updated
     *       400:
     *         description: Missing title or content
     *       401:
     *         description: Unauthorized - Missing or invalid token.
     *       404:
     *         description: Note not found
     */

    const { id } = req.params;
    const { data, error } = await supabase
        .from("notes")
        .update({ content: req.body.content, title: req.body.title })
        .eq("id", id)
        .select("id");

    if (error) return res.status(500).json({ error: error.message });
    if (!data || data.length === 0) return res.status(404).json({ error: "Note not found" });

    return res.status(200).json("Updated");
});

router.get("/notes/:id", token_auth, async (req, res) => {
/**
 * @swagger
 * /soleil/notes/{id}:
 *   get:
 *     summary: single note
 *     description: Retrieve a single note from the database.
 *     security:
 *       - tokenAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The note ID.
 *     responses:
 *       200:
 *         description: A single note.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NoteDto'
 *       401:
 *         description: Unauthorized - Missing or invalid token.
 */


    const { id } = req.params;
    const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("id", id);

    if (!data || data.length === 0) return res.status(404).json({ error: "Note not found" });

    if (error) {
        return res.status(500).json({ error: error.message });
    }
    return res.status(200).json(data);
});

router.delete("/notes/:id", token_auth, async (req, res) => {
    /**
 * @swagger
 * /soleil/notes/{id}:
 *   delete:
 *     summary: Delete
 *     description: Delete an existing note from the database.
 *     security:
 *       - tokenAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The note ID.
 *     responses:
 *       200:
 *         description: Note deleted
 *       404:
 *         description: Note not found
 */
    const { id } = req.params;
    const { data, error } = await supabase
        .from("notes")
        .delete()
        .eq("id", id)
        .select("id")

    if (!data || data.length === 0) return res.status(404).json({ error: "Note not found" });

    if (error) {
        return res.status(500).json({ error: error.message });
    }
    return res.status(200).json("Deleted");
});

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     NoteDto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The note ID.
 *         title:
 *           type: string
 *           description: The title of the note.
 *         content:
 *           type: string
 *           description: The content of the note.
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The creation date of the note.
 *       required:
 *         - title
 *         - content
 *       example:
 *         id: 1
 *         title: Sample Note
 *         content: This is a sample note.
 *         created_at: 2023-10-01T12:00:00Z
 *
 *     NoteCreateDto:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: The title of the note.
 *         content:
 *           type: string
 *           description: The content of the note.
 *       required:
 *         - title
 *         - content
 *       example:
 *         title: New Note
 *         content: This is the content of the new note.
 */

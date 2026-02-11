#!/usr/bin/env node
'use strict';

const port = (() => {
    const args = process.argv;

    if (args.length !== 3) {
        console.error("usage: node index.js port");
        process.exit(1);
    }

    const num = parseInt(args[2], 10);
    if (isNaN(num)) {
        console.error("error: argument must be an integer.");
        process.exit(1);
    }

    return num;
})();

const express = require("express");
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello World!");
});

const basicAuth = require('./middleware/basicAuth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

app.get('/hello', basicAuth, (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

// ADD YOUR WORK HERE
app.post("/users", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Invalid payload" });
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
        return res.status(409).json({ message: "A user with that username already exists" });
    }

    const user = await prisma.user.create({ data: { username, password } });
    res.status(201).json(user);
});

app.get("/notes", async (req, res) => {
    const { done } = req.query;

    if (done !== undefined && done !== "true" && done !== "false") {
        return res.status(400).json({ message: "Invalid payload" });
    }

    const where = { public: true }
    if (done !== undefined) {
        where.completed = done === "true" ? true : false;
    }

    const notes = await prisma.note.findMany({ where });
    res.status(200).json(notes);
});

app.get("/notes/:noteId", basicAuth, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    const noteId = parseInt(req.params.noteId);

    if (isNaN(noteId)) {
        return res.status(404).json({ message: "Not found" });
    }

    const note = await prisma.note.findUnique({ where: { id: noteId } });
    if (!note) {
        return res.status(404).json({ message: "Not found" });
    }

    if (note.userId !== req.user.id) {
        return res.status(403).json({ message: "Not permitted" });
    }

    res.status(200).json(note);
});

app.post("/notes", basicAuth, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    const { title, description, completed, public: isPublic } = req.body;

    if (
        typeof title !== "string" || title.trim() === '' || 
        typeof description !== 'string' || description.trim() === '' ||
        typeof completed !== 'boolean' ||
        typeof isPublic !== 'boolean'
    ) {
        return res.status(400).json({ message: "Invalid payload" });
    }

    const note = await prisma.note.create({
        data: {
            title: title.trim(),
            description: description.trim(),
            completed,
            public: isPublic,
            userId: req.user.id
        },
    });

    res.status(201).json(note);
});

app.patch("/notes/:noteId", basicAuth, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    const noteId = parseInt(req.params.noteId);
    if (isNaN(noteId)) {
        return res.status(404).json({ message: "Not found" });
    }

    const note = await prisma.note.findUnique({ where: { id: noteId } });
    if (!note) {
        return res.status(404).json({ message: "Not found" });
    }

    if (note.userId !== req.user.id) {
        return res.status(403).json({ message: "Not permitted" });
    }

    const { title, description, completed, public: isPublic } = req.body;
    if (!title && !description && !completed && !isPublic) {
        return res.status(400).json({ message: "Invalid payload" });
    }

    if (title && (typeof title !== "string" || title.trim() === '')) {
        return res.status(400).json({ message: "Invalid payload" });
    }

    if (description && (typeof description !== "string" || description.trim() === '')) {
        return res.status(400).json({ message: "Invalid payload" });
    }

    if (completed && typeof completed !== 'boolean') {
        return res.status(400).json({ message: "Invalid payload" });
    }

    if (isPublic && typeof isPublic !== 'boolean') {
        return res.status(400).json({ message: "Invalid payload" });
    }

    const data = {};

    if (title) {
        data.title = title;
    }

    if (description) {
        data.description = description;
    }

    if (completed) {
        data.completed = completed;
    }

    if (isPublic) {
        data.public = isPublic;
    }

    const updated = await prisma.note.update({
        where: { id: noteId },
        data
    });

    return res.status(200).json(updated);
});
// ==================

const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

server.on('error', (err) => {
    console.error(`cannot start server: ${err.message}`);
    process.exit(1);
});
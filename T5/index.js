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

// ADD YOUR WORK HERE
const data = [
  {
    title: "Buy groceries",
    description: "Milk, Bread, Eggs, Butter",
    completed: false
  },
  {
    title: "Walk the dog",
    description: "Take Bella for a walk in the park",
    completed: true
  },
  {
    title: "Read a book",
    description: "Finish reading 'The Great Gatsby'",
    completed: false
  }
];

app.get("/notes", (req, res) => {
    const { done } = req.query;

    if (done !== undefined && done !== "true" && done !== "false") {
        return res.status(400).send("Bad request");
    }

    let result = data;

    if (done === "true") {
        result = data.filter(note => note.completed === true);
    } else if (done === "false") {
        result = data.filter(note => note.completed === false);
    }

    res.json(result);
});

app.get("/notes/:noteId", (req, res) => {
    const noteId = Number(req.params.noteId);

    if (!Number.isInteger(noteId)) {
        return res.status(400).send("Bad request");
    }

    if (noteId < 0 || noteId >= data.length) {
        return res.status(404).send("Not found");
    }

    res.json(data[noteId]);
});

app.post("/notes", (req, res) => {
    const newNote = req.body;

    const noteToReturn = structuredClone(newNote);
    noteToReturn.id = data.length;

    data.push(newNote);

    res.status(201).json(noteToReturn);
});

app.patch("/notes/:noteId", (req, res) => {
    const { done } = req.query;
    const noteId = Number(req.params.noteId);

    if (done !== "true" && done !== "false") {
        return res.status(400).send("Bad request");
    }

    if (!Number.isInteger(noteId)) {
        return res.status(400).send("Bad request");
    }

    if (noteId < 0 || noteId >= data.length) {
        return res.status(404).send("Not found");
    }

    const note = data[noteId];
    note.completed = (done === "true");

    res.status(200).json(note);
});
// ==================

const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

server.on('error', (err) => {
    console.error(`cannot start server: ${err.message}`);
    process.exit(1);
});
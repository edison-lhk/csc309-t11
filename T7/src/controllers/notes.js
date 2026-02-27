const { NoteService } = require("../services/notes");

async function listNotesController(req, res) {
    const { done } = req.query;

    if (done !== undefined && done !== "true" && done !== "false") {
        return res.status(400).json({ message: "Invalid payload" });
    }

    const where = { public: true };
    if (done !== undefined) {
        where.completed = done === "true";
    }

    const notes = await NoteService.list(where);
    return res.status(200).json(notes);
}

async function retrieveNoteController(req, res) {
    if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    const noteId = parseInt(req.params.noteId, 10);
    if (isNaN(noteId)) {
        return res.status(404).json({ message: "Not found" });
    }

    const note = await NoteService.retrieve(noteId, req.user.id);
    if (!note) {
        return res.status(404).json({ message: "Not found" });
    }

    return res.status(200).json(note);
}

async function createNoteController(req, res) {
    if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    const { title, description, completed, public: isPublic } = req.body;

    if (
        typeof title !== "string" ||
        title.trim() === "" ||
        typeof description !== "string" ||
        description.trim() === "" ||
        typeof completed !== "boolean" ||
        typeof isPublic !== "boolean"
    ) {
        return res.status(400).json({ message: "Invalid payload" });
    }

    const note = await NoteService.create({
        title: title.trim(),
        description: description.trim(),
        completed,
        public: isPublic,
        userId: req.user.id,
    });

    return res.status(201).json(note);
}

async function updateNoteController(req, res) {
    if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    const noteId = parseInt(req.params.noteId, 10);
    if (isNaN(noteId)) {
        return res.status(404).json({ message: "Not found" });
    }

    const { title, description, completed, public: isPublic } = req.body;

    const hasAnyField =
        title !== undefined || description !== undefined || completed !== undefined || isPublic !== undefined;

    if (!hasAnyField) {
        return res.status(400).json({ message: "Invalid payload" });
    }

    if (title !== undefined && (typeof title !== "string" || title.trim() === "")) {
        return res.status(400).json({ message: "Invalid payload" });
    }

    if (description !== undefined && (typeof description !== "string" || description.trim() === "")) {
        return res.status(400).json({ message: "Invalid payload" });
    }

    if (completed !== undefined && typeof completed !== "boolean") {
        return res.status(400).json({ message: "Invalid payload" });
    }

    if (isPublic !== undefined && typeof isPublic !== "boolean") {
        return res.status(400).json({ message: "Invalid payload" });
    }

    const data = {};
    if (title !== undefined) data.title = title.trim();
    if (description !== undefined) data.description = description.trim();
    if (completed !== undefined) data.completed = completed;
    if (isPublic !== undefined) data.public = isPublic;

    const updated = await NoteService.update(noteId, req.user.id, data);
    if (!updated) {
        return res.status(404).json({ message: "Not found" });
    }

    return res.status(200).json(updated);
}

module.exports = { listNotesController, retrieveNoteController, createNoteController, updateNoteController };

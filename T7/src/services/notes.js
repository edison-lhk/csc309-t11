const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class NoteService {
    static data = [
        {
            title: "Buy groceries",
            description: "Milk, Bread, Eggs, Butter",
            completed: false,
        },
        {
            title: "Walk the dog",
            description: "Take Bella for a walk in the park",
            completed: true,
        },
        {
            title: "Read a book",
            description: "Finish reading 'The Great Gatsby'",
            completed: false,
        },
    ];

    static async list(condition) {
        const where = condition ?? {};
        return prisma.note.findMany({ where });
    }

    static async retrieve(noteId, userId) {
        return prisma.note.findFirst({
            where: { id: noteId, userId },
        });
    }

    static async create(newNote) {
        return prisma.note.create({ data: newNote });
    }

    static async update(noteId, userId, newNote) {
        const existing = await prisma.note.findFirst({
            where: { id: noteId, userId },
            select: { id: true },
        });

        if (!existing) return null;

        return prisma.note.update({
            where: { id: noteId },
            data: newNote,
        });
    }
}

module.exports = { NoteService };

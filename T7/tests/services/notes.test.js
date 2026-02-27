const { PrismaClient } = require("@prisma/client");
const { NoteService } = require("src/services/notes");

const prisma = new PrismaClient();

describe("NoteService", () => {
  beforeEach(async () => {
    await prisma.note.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test(".list(): it should return notes matching condition", async () => {
    const u1 = await prisma.user.create({ data: { username: "u1", password: "pw" } });

    await prisma.note.create({
      data: {
        title: "A",
        description: "D",
        completed: true,
        public: true,
        userId: u1.id,
      },
    });

    await prisma.note.create({
      data: {
        title: "B",
        description: "D",
        completed: false,
        public: true,
        userId: u1.id,
      },
    });

    const doneNotes = await NoteService.list({ completed: true });
    expect(doneNotes.length).toBe(1);
    expect(doneNotes[0].title).toBe("A");
  });

  test(".create(): it should create a note", async () => {
    const u1 = await prisma.user.create({ data: { username: "u1", password: "pw" } });

    const note = await NoteService.create({
      title: "New",
      description: "Desc",
      completed: false,
      public: true,
      userId: u1.id,
    });

    expect(note).toHaveProperty("id");
    expect(note.userId).toBe(u1.id);
  });

  test(".retrieve(): it should retrieve note for correct userId", async () => {
    const u1 = await prisma.user.create({ data: { username: "u1", password: "pw" } });

    const created = await prisma.note.create({
      data: {
        title: "Mine",
        description: "Desc",
        completed: false,
        public: false,
        userId: u1.id,
      },
    });

    const note = await NoteService.retrieve(created.id, u1.id);
    expect(note).not.toBeNull();
    expect(note.id).toBe(created.id);
  });

  test(".update(): it should update note for correct userId", async () => {
    const u1 = await prisma.user.create({ data: { username: "u1", password: "pw" } });

    const created = await prisma.note.create({
      data: {
        title: "Old",
        description: "Desc",
        completed: false,
        public: false,
        userId: u1.id,
      },
    });

    const updated = await NoteService.update(created.id, u1.id, {
      title: "New",
      completed: true,
    });

    expect(updated).not.toBeNull();
    expect(updated.title).toBe("New");
    expect(updated.completed).toBe(true);
  });
});
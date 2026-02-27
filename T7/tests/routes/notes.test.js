const request = require("supertest");
const app = require("src/index");
const { PrismaClient } = require("@prisma/client");
const { basicAuthHeader } = require("../helpers");

const prisma = new PrismaClient();

async function seedUser(username, password) {
  return prisma.user.create({ data: { username, password } });
}

async function seedNote({ title, description, completed, isPublic, userId }) {
  return prisma.note.create({
    data: {
      title,
      description,
      completed,
      public: isPublic,
      userId,
    },
  });
}

describe("Notes endpoints", () => {
  beforeEach(async () => {
    await prisma.note.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("GET /notes", () => {
    test("It should return public notes (optionally filtered by done)", async () => {
      const u1 = await seedUser("u1", "pw");

      await seedNote({
        title: "pub done",
        description: "d",
        completed: true,
        isPublic: true,
        userId: u1.id,
      });
      await seedNote({
        title: "pub not done",
        description: "d",
        completed: false,
        isPublic: true,
        userId: u1.id,
      });

      await seedNote({
        title: "private",
        description: "d",
        completed: false,
        isPublic: false,
        userId: u1.id,
      });

      const resAll = await request(app).get("/notes");
      expect(resAll.statusCode).toBe(200);
      expect(Array.isArray(resAll.body)).toBe(true);
      expect(resAll.body.map((n) => n.title).sort()).toEqual(
        ["pub done", "pub not done"].sort()
      );

      const resDone = await request(app).get("/notes").query({ done: "true" });
      expect(resDone.statusCode).toBe(200);
      expect(resDone.body.length).toBe(1);
      expect(resDone.body[0].title).toBe("pub done");
    });
  });

  describe("POST /notes", () => {
    test("It should create a note for authenticated user", async () => {
      const u1 = await seedUser("alice", "pw123");

      const res = await request(app)
        .post("/notes")
        .set("Authorization", basicAuthHeader("alice", "pw123"))
        .send({
          title: "New note",
          description: "Hello",
          completed: false,
          public: true,
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.title).toBe("New note");
      expect(res.body.description).toBe("Hello");
      expect(res.body.completed).toBe(false);
      expect(res.body.public).toBe(true);
      expect(res.body.userId).toBe(u1.id);
    });
  });

  describe("GET /notes/:noteId", () => {
    test("Happy path: retrieves own note when authenticated", async () => {
      const u1 = await seedUser("bob", "pw");
      const note = await seedNote({
        title: "Mine",
        description: "Desc",
        completed: false,
        isPublic: false,
        userId: u1.id,
      });

      const res = await request(app)
        .get(`/notes/${note.id}`)
        .set("Authorization", basicAuthHeader("bob", "pw"));

      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(note.id);
      expect(res.body.title).toBe("Mine");
      expect(res.body.userId).toBe(u1.id);
    });
  });

  describe("PATCH /notes/:noteId", () => {
    test("It should update own note when authenticated", async () => {
      const u1 = await seedUser("carol", "pw");
      const note = await seedNote({
        title: "Old",
        description: "Old desc",
        completed: false,
        isPublic: false,
        userId: u1.id,
      });

      const res = await request(app)
        .patch(`/notes/${note.id}`)
        .set("Authorization", basicAuthHeader("carol", "pw"))
        .send({
          title: "New",
          completed: true,
          public: true,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(note.id);
      expect(res.body.title).toBe("New");
      expect(res.body.completed).toBe(true);
      expect(res.body.public).toBe(true);
    });

    test("400: invalid payload (no fields provided)", async () => {
      const u1 = await seedUser("dave", "pw");
      const note = await seedNote({
        title: "T",
        description: "D",
        completed: false,
        isPublic: false,
        userId: u1.id,
      });

      const res = await request(app)
        .patch(`/notes/${note.id}`)
        .set("Authorization", basicAuthHeader("dave", "pw"))
        .send({}); // invalid

      expect(res.statusCode).toBe(400);
    });

    test("401: not authenticated (no auth header)", async () => {
      const u1 = await seedUser("erin", "pw");
      const note = await seedNote({
        title: "T",
        description: "D",
        completed: false,
        isPublic: false,
        userId: u1.id,
      });

      const res = await request(app).patch(`/notes/${note.id}`).send({ title: "X" });

      expect(res.statusCode).toBe(401);
    });

    test("403: not permitted (trying to update another user's note)", async () => {
      const u1 = await seedUser("owner", "pw1");
      const u2 = await seedUser("attacker", "pw2");

      const note = await seedNote({
        title: "Owner note",
        description: "D",
        completed: false,
        isPublic: false,
        userId: u1.id,
      });

      const res = await request(app)
        .patch(`/notes/${note.id}`)
        .set("Authorization", basicAuthHeader("attacker", "pw2"))
        .send({ title: "Hacked" });

      expect(res.statusCode).toBe(403);
    });

    test("404: not found (note does not exist)", async () => {
      await seedUser("frank", "pw");

      const res = await request(app)
        .patch("/notes/999999")
        .set("Authorization", basicAuthHeader("frank", "pw"))
        .send({ title: "Doesn't matter" });

      expect(res.statusCode).toBe(404);
    });
  });
});
const request = require("supertest");
const app = require("src/index");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

describe("POST /users", () => {
  beforeEach(async () => {
    await prisma.note.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("It should create a user", async () => {
    const payload = { username: "alice", password: "pw123" };

    const res = await request(app).post("/users").send(payload);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.username).toBe("alice");
    expect(res.body.password).toBe("pw123");
  });
});
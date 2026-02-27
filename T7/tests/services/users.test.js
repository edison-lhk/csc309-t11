const { PrismaClient } = require("@prisma/client");
const { UserService } = require("src/services/users");

const prisma = new PrismaClient();

describe("UserService", () => {
  beforeEach(async () => {
    await prisma.note.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test(".create(): it should create a user", async () => {
    const user = await UserService.create({ username: "alice", password: "pw" });

    expect(user).toHaveProperty("id");
    expect(user.username).toBe("alice");
  });
});
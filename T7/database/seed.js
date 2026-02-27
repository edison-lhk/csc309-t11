// Import the shared Prisma client instance.
// This ensures we reuse the same database connection configuration everywhere.
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function seedData() {
    const mockUsers = [
        {
            username: "alice",
            password: "123123",
        },
        {
            username: "bob",
            password: "123123",
        },
    ];

    for (const user of mockUsers) {
        await prisma.user.create({ data: user });
    }
}

seedData().finally(() => prisma.$disconnect());

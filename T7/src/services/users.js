const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class UserService {
    static async create(newUser) {
        const { username, password } = newUser;

        const existing = await prisma.user.findUnique({ where: { username } });
        if (existing) return null;

        const user = await prisma.user.create({
            data: { username, password },
        });

        return user;
    }
}

module.exports = { UserService };

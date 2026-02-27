require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
const url = process.env.DATABASE_URL;

if (!url) {
    console.error("error: DATABASE_URL is not set");
    process.exit(1);
}

const adapter = new PrismaBetterSqlite3({ url });
module.exports = new PrismaClient({ adapter });

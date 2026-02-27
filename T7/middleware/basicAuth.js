const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const basicAuth = async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
        req.user = null;
        return next();
    }

    try {
        const credential = authHeader.split(" ")[1];
        const decoded = Buffer.from(credential, "base64").toString("utf-8");
        const [username, password] = decoded.split(":");

        if (!username || !password) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const user = await prisma.user.findUnique({ where: { username } });

        if (!user | (user.password !== password)) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
};

module.exports = basicAuth;

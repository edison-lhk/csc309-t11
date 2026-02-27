const { UserService } = require("../services/users");

async function createUserController(req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Invalid payload" });
    }

    const user = await UserService.create({ username, password });
    if (!user) {
        return res.status(409).json({ message: "A user with that username already exists" });
    }

    return res.status(201).json(user);
}

module.exports = { createUserController };

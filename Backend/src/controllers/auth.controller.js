const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({ adapter });
const registerUser = async (req, res) => {
const { name, college, year, branch, email, password } = req.body;

    if (!name || !college || !year || !branch || !email || !password) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

const existingUser = await prisma.user.findUnique({
        where: {
            email: email
        }
    });

    if (existingUser) {
        return res.status(409).json({
            message: "Email already registered"
        });
    }
const hashedPassword = await bcrypt.hash(password, 10);
const user = await prisma.user.create({
    data: {
        name,
        college,
        year,
        branch,
        email,
        password: hashedPassword
    }
});

res.status(201).json({
    message: "User registered successfully",
    user: {
        id: user.id,
        name: user.name,
        college: user.college,
        year: user.year,
        branch: user.branch,
        email: user.email
    }
});
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // 1. Check required fields
    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    // 2. Find user by email
    const user = await prisma.user.findUnique({
        where: {
            email: email
        }
    });

    // 3. Check if user exists
    if (!user) {
        return res.status(401).json({
            message: "Invalid email or password"
        });
    }
    // 4. Compare entered password with hashed password
    const isPasswordCorrect = await bcrypt.compare(
        password,
        user.password
    );

    // 5. Check password
    if (!isPasswordCorrect) {
        return res.status(401).json({
            message: "Invalid email or password"
        });
    }
const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
);

    // 6. Login successful
    return res.status(200).json({
    message: "Login successful",
    token
});
};

module.exports = {
    registerUser,
    loginUser
};
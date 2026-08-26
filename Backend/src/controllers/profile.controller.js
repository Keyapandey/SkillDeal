const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({ adapter });


const getProfile = async (req, res) => {
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
        where: {
            id: userId
        },

        select: {
            id: true,
            name: true,
            email: true,
            college: true,
            year: true,
            branch: true,
            about: true,
            linkedin: true,
            github: true,
            instagram: true,
            xp: true,
            level: true,
            streak:true,
            createdAt: true,

            skills: {
                include: {
                    skill: true
                }
            },

            achievements: {
                include: {
                    achievement: true
                },
                orderBy: {
                    unlockedAt: "desc"
                }
            }
        }
    });

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }


    // Count lifetime completed exchanges
    const totalExchanges = await prisma.exchange.count({
        where: {
            status: "COMPLETED",

            OR: [
                {
                    senderId: userId
                },
                {
                    receiverId: userId
                }
            ]
        }
    });


    // Separate teach and learn skills
    const teachSkills = user.skills
        .filter(item => item.type === "TEACH")
        .map(item => item.skill);

    const learnSkills = user.skills
        .filter(item => item.type === "LEARN")
        .map(item => item.skill);


    // Clean achievement data
    const achievements = user.achievements.map(item => ({
        id: item.achievement.id,
        name: item.achievement.name,
        description: item.achievement.description,
        xpReward: item.achievement.xpReward,
        unlockedAt: item.unlockedAt
    }));


    return res.status(200).json({
        profile: {
            id: user.id,
            name: user.name,
            email: user.email,
            college: user.college,
            year: user.year,
            branch: user.branch,

            about: user.about,
            linkedin: user.linkedin,
            github: user.github,
            instagram: user.instagram,

            xp: user.xp,
            level: user.level,
            streak: user.streak,

            totalExchanges,

            teachSkills,
            learnSkills,

            achievements,

            memberSince: user.createdAt
        }
    });
};

const updateProfile = async (req, res) => {
    const userId = req.user.userId;

    const {
        name,
        college,
        year,
        branch,
        about,
        linkedin,
        github,
        instagram
    } = req.body;

    const updatedUser = await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            ...(name !== undefined && { name }),
            ...(college !== undefined && { college }),
            ...(year !== undefined && { year: Number(year) }),
            ...(branch !== undefined && { branch }),
            ...(about !== undefined && { about }),
            ...(linkedin !== undefined && { linkedin }),
            ...(github !== undefined && { github }),
            ...(instagram !== undefined && { instagram })
        },

        select: {
            id: true,
            name: true,
            email: true,
            college: true,
            year: true,
            branch: true,
            about: true,
            linkedin: true,
            github: true,
            instagram: true,
            xp: true,
            level: true
        }
    });

    return res.status(200).json({
        message: "Profile updated successfully",
        profile: updatedUser
    });
};

module.exports = {
    getProfile,
    updateProfile
};
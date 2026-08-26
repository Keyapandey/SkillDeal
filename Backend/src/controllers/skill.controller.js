const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({ adapter });


const addSkill = async (req, res) => {
    const { skillId, type } = req.body;

    // Check required fields
    if (!skillId || !type) {
        return res.status(400).json({
            message: "skillId and type are required"
        });
    }

    // Check whether type is valid
    if (type !== "TEACH" && type !== "LEARN") {
        return res.status(400).json({
            message: "Type must be TEACH or LEARN"
        });
    }

    // Check whether the skill exists
    const skill = await prisma.skill.findUnique({
        where: {
            id: skillId
        }
    });

    if (!skill) {
        return res.status(404).json({
            message: "Skill not found"
        });
    }

    

    // Check if user already has this skill with this type
    const existingUserSkill = await prisma.userSkill.findUnique({
        where: {
            userId_skillId_type: {
                userId: req.user.userId,
                skillId: skillId,
                type: type
            }
        }
    });

    if (existingUserSkill) {
        return res.status(409).json({
            message: "Skill already added"
        });
    }

    // Add skill to user
    const userSkill = await prisma.userSkill.create({
        data: {
            userId: req.user.userId,
            skillId: skillId,
            type: type
        }
    });

    return res.status(201).json({
        message: "Skill added successfully",
        userSkill
    });
};

const deleteSkill = async (req, res) => {
    const { skillId, type } = req.body;

    if (!skillId || !type) {
        return res.status(400).json({
            message: "skillId and type are required"
        });
    }

    if (type !== "TEACH" && type !== "LEARN") {
        return res.status(400).json({
            message: "Type must be TEACH or LEARN"
        });
    }

    const userSkill = await prisma.userSkill.findUnique({
        where: {
            userId_skillId_type: {
                userId: req.user.userId,
                skillId: Number(skillId),
                type: type
            }
        }
    });

    if (!userSkill) {
        return res.status(404).json({
            message: "Skill not found"
        });
    }

    await prisma.userSkill.delete({
        where: {
            userId_skillId_type: {
                userId: req.user.userId,
                skillId: Number(skillId),
                type: type
            }
        }
    });

    return res.status(200).json({
        message: "Skill removed successfully"
    });
};

const getUserSkills = async (req, res) => {
    const userSkills = await prisma.userSkill.findMany({
        where: {
            userId: req.user.userId
        },
        include: {
            skill: true
        }
    });

    const teach = userSkills
        .filter(userSkill => userSkill.type === "TEACH")
        .map(userSkill => userSkill.skill);

    const learn = userSkills
        .filter(userSkill => userSkill.type === "LEARN")
        .map(userSkill => userSkill.skill);

    return res.status(200).json({
        teach,
        learn
    });
};

const getAllSkills = async (req, res) => {
    const skills = await prisma.skill.findMany({
        orderBy: {
            name: "asc"
        }
    });

    return res.status(200).json({
        skills
    });
};

const searchUsersBySkill = async (req, res) => {
    const { skillId } = req.query;

    if (!skillId) {
        return res.status(400).json({
            message: "skillId is required"
        });
    }

    const users = await prisma.user.findMany({
        where: {
            skills: {
                some: {
                    skillId: Number(skillId),
                    type: "TEACH"
                }
            }
        },
        select: {
            id: true,
            name: true,
            college: true,
            year: true,
            branch: true,
            skills: {
              include: {
                 skill: true
                }
            }
        }
    });

    return res.status(200).json({
        users
    });
};
const getAllUsers = async (req, res) => {

    const where = req.user
        ? {
            id: {
                not: req.user.userId
            }
        }
        : {};

    const users = await prisma.user.findMany({
        where,
        select: {
            id: true,
            name: true,
            college: true,
            year: true,
            branch: true,
            skills: {
                include: {
                    skill: true
                }
            }
        }
    });

    return res.status(200).json({
        users
    });
};
module.exports = {
    addSkill,
    deleteSkill,
    getUserSkills,
    getAllSkills,
    searchUsersBySkill,
    getAllUsers
};
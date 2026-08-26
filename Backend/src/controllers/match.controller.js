const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({ adapter });


const getMatches = async (req, res) => {
    const userId = req.user.userId;

    // Get logged-in user's skills
    const mySkills = await prisma.userSkill.findMany({
        where: {
            userId: userId
        }
    });

    const myTeachSkills = mySkills
        .filter(skill => skill.type === "TEACH")
        .map(skill => skill.skillId);

    const myLearnSkills = mySkills
        .filter(skill => skill.type === "LEARN")
        .map(skill => skill.skillId);

    // Get ALL other users
    const potentialUsers = await prisma.user.findMany({
        where: {
            id: {
                not: userId
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

    const matches = potentialUsers.map(user => {

        const theirTeachSkills = user.skills
            .filter(skill => skill.type === "TEACH")
            .map(skill => skill.skillId);

        const theirLearnSkills = user.skills
            .filter(skill => skill.type === "LEARN")
            .map(skill => skill.skillId);

        // What they teach that I want to learn
        const teachMatches = theirTeachSkills.filter(skillId =>
            myLearnSkills.includes(skillId)
        ).length;

        // What they want to learn that I can teach
        const learnMatches = theirLearnSkills.filter(skillId =>
            myTeachSkills.includes(skillId)
        ).length;

        const totalMatches = teachMatches + learnMatches;

        const totalPossibleMatches =
            myLearnSkills.length + myTeachSkills.length;

        // If I haven't added any skills yet,
        // everyone gets 0% instead of disappearing.
        const matchPercentage =
            totalPossibleMatches === 0
                ? 0
                : Math.round(
                    (totalMatches / totalPossibleMatches) * 100
                );

        const theyTeachMe = user.skills
            .filter(skill =>
                skill.type === "TEACH" &&
                myLearnSkills.includes(skill.skillId)
            )
            .map(skill => skill.skill);

        const theyLearnFromMe = user.skills
            .filter(skill =>
                skill.type === "LEARN" &&
                myTeachSkills.includes(skill.skillId)
            )
            .map(skill => skill.skill);

        return {
            id: user.id,
            name: user.name,
            college: user.college,
            year: user.year,
            branch: user.branch,
            theyTeachMe,
            theyLearnFromMe,
            matchPercentage
        };
    });

    // Highest matches first
    matches.sort(
        (a, b) => b.matchPercentage - a.matchPercentage
    );

    return res.status(200).json({
        matches
    });
};

const getGuestMatches = async (req, res) => {
    const users = await prisma.user.findMany({
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

    const matches = users.map(user => {

        const theyTeachMe = user.skills
            .filter(skill => skill.type === "TEACH")
            .map(skill => skill.skill);

        const theyLearnFromMe = user.skills
            .filter(skill => skill.type === "LEARN")
            .map(skill => skill.skill);

        return {
            id: user.id,
            name: user.name,
            college: user.college,
            year: user.year,
            branch: user.branch,
            theyTeachMe,
            theyLearnFromMe,
            matchPercentage: 0,
            rating: 0
        };
    });

    return res.status(200).json({
        matches
    });
};

module.exports = {
    getMatches,
    getGuestMatches
};
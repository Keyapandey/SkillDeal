const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({ adapter });


const checkAndUnlockAchievements = async (userId) => {

    const achievements = await prisma.achievement.findMany();

    const unlockedAchievements = await prisma.userAchievement.findMany({
        where: {
            userId
        },
        select: {
            achievementId: true
        }
    });

    const unlockedIds = new Set(
        unlockedAchievements.map(item => item.achievementId)
    );

    const userExchanges = await prisma.exchange.findMany({
        where: {
            status: "COMPLETED",
            OR: [
                { senderId: userId },
                { receiverId: userId }
            ]
        },
        select: {
            senderId: true,
            receiverId: true,
            completedAt: true
        }
    });

    const totalExchanges = userExchanges.length;


    // Unique people exchanged with

    const uniquePartners = new Set();

    userExchanges.forEach(exchange => {

        const partnerId =
            exchange.senderId === userId
                ? exchange.receiverId
                : exchange.senderId;

        uniquePartners.add(partnerId);
    });

    const friendsCount = uniquePartners.size;


    // User skills

    const userSkills = await prisma.userSkill.findMany({
        where: {
            userId
        },
        select: {
            type: true
        }
    });

    const learnSkillsCount = userSkills.filter(
        skill => skill.type === "LEARN"
    ).length;

    const teachSkillsCount = userSkills.filter(
        skill => skill.type === "TEACH"
    ).length;


    // Active weeks

    const activeWeeks = new Set();

    userExchanges.forEach(exchange => {

        if (!exchange.completedAt) return;

        const date = new Date(exchange.completedAt);

        const year = date.getUTCFullYear();

        const firstDay = new Date(
            Date.UTC(year, 0, 1)
        );

        const dayOfYear = Math.floor(
            (date - firstDay) /
            (1000 * 60 * 60 * 24)
        );

        const weekNumber = Math.floor(dayOfYear / 7);

        activeWeeks.add(`${year}-${weekNumber}`);
    });

    const activeWeeksCount = activeWeeks.size;


    const requirementReached = (requirement) => {

        switch (requirement) {

            case "FIRST_EXCHANGE":
                return totalExchanges >= 1;

            case "FIVE_FRIENDS":
                return friendsCount >= 5;

            case "FIVE_EXCHANGES":
                return totalExchanges >= 5;

            case "TEN_EXCHANGES":
                return totalExchanges >= 10;

            case "THREE_LEARN_SKILLS":
                return learnSkillsCount >= 3;

            case "THREE_TEACH_SKILLS":
                return teachSkillsCount >= 3;

            case "THREE_ACTIVE_WEEKS":
                return activeWeeksCount >= 3;

            case "FIVE_SKILLS_LEARNED":
                return learnSkillsCount >= 5;

            case "FIVE_SKILLS_TAUGHT":
                return teachSkillsCount >= 5;

            case "TWENTY_FIVE_EXCHANGES":
                return totalExchanges >= 25;

            default:
                return false;
        }
    };


    for (const achievement of achievements) {

        if (unlockedIds.has(achievement.id)) {
            continue;
        }

        if (requirementReached(achievement.requirement)) {

            await prisma.$transaction([

                prisma.userAchievement.create({
                    data: {
                        userId,
                        achievementId: achievement.id
                    }
                }),

                prisma.user.update({
                    where: {
                        id: userId
                    },
                    data: {
                        xp: {
                            increment: achievement.xpReward
                        }
                    }
                })

            ]);
        }
    }
};


const getLeaderboard = async (req, res) => {

    // ==========================================
    // GUEST LEADERBOARD
    // ==========================================

    if (req.isGuest) {

        const now = new Date();

        const startOfMonth = new Date(
            Date.UTC(
                now.getUTCFullYear(),
                now.getUTCMonth(),
                1
            )
        );

        const startOfNextMonth = new Date(
            Date.UTC(
                now.getUTCFullYear(),
                now.getUTCMonth() + 1,
                1
            )
        );


        const exchanges = await prisma.exchange.findMany({
            where: {
                status: "COMPLETED",
                completedAt: {
                    gte: startOfMonth,
                    lt: startOfNextMonth
                }
            },
            select: {
                senderId: true,
                receiverId: true
            }
        });


        const exchangeCounts = {};


        for (const exchange of exchanges) {

            exchangeCounts[exchange.senderId] =
                (exchangeCounts[exchange.senderId] || 0) + 1;

            exchangeCounts[exchange.receiverId] =
                (exchangeCounts[exchange.receiverId] || 0) + 1;
        }


        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                college: true,
                year: true,
                branch: true
            }
        });


        const leaderboard = users.map(user => ({

            id: user.id,

            name: user.name,

            college: user.college,

            year: user.year,

            branch: user.branch,

            monthlyExchanges:
                exchangeCounts[user.id] || 0
        }));


        leaderboard.sort(
            (a, b) =>
                b.monthlyExchanges -
                a.monthlyExchanges
        );


        leaderboard.forEach((user, index) => {

            user.rank = index + 1;

        });


        return res.status(200).json({

            month: startOfMonth.toISOString(),

            level: null,

            currentUser: null,

            leaderboard,

            achievements: []
        });
    }


    // ==========================================
    // LOGGED-IN USER
    // ==========================================

    const userId = req.user.userId;

    await checkAndUnlockAchievements(userId);


    // --------------------------------------------------
    // CURRENT USER
    // --------------------------------------------------

    const currentUser = await prisma.user.findUnique({

        where: {
            id: userId
        },

        select: {
            id: true,
            name: true,
            level: true,
            xp: true
        }
    });


    if (!currentUser) {

        return res.status(404).json({
            message: "User not found"
        });

    }


    // --------------------------------------------------
    // MONTHLY LEADERBOARD
    // --------------------------------------------------

    const now = new Date();

    const startOfMonth = new Date(
        Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            1
        )
    );

    const startOfNextMonth = new Date(
        Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth() + 1,
            1
        )
    );


    const exchanges = await prisma.exchange.findMany({

        where: {

            status: "COMPLETED",

            completedAt: {
                gte: startOfMonth,
                lt: startOfNextMonth
            }
        },

        select: {
            senderId: true,
            receiverId: true
        }
    });


    const exchangeCounts = {};


    for (const exchange of exchanges) {

        exchangeCounts[exchange.senderId] =
            (exchangeCounts[exchange.senderId] || 0) + 1;

        exchangeCounts[exchange.receiverId] =
            (exchangeCounts[exchange.receiverId] || 0) + 1;
    }


    const users = await prisma.user.findMany({

        where: {
            level: currentUser.level
        },

        select: {

            id: true,

            name: true,

            college: true,

            year: true,

            branch: true,

            xp: true,

            level: true
        }
    });


    const leaderboard = users.map(user => ({

        id: user.id,

        name: user.name,

        college: user.college,

        year: user.year,

        branch: user.branch,

        level: user.level,

        xp: user.xp,

        monthlyExchanges:
            exchangeCounts[user.id] || 0
    }));


    leaderboard.sort(
        (a, b) =>
            b.monthlyExchanges -
            a.monthlyExchanges
    );


    leaderboard.forEach((user, index) => {

        user.rank = index + 1;

    });


    const currentUserEntry =
        leaderboard.find(
            user => user.id === currentUser.id
        );


    // ==================================================
    // ACHIEVEMENTS
    // ==================================================

    const achievements = await prisma.achievement.findMany({

        orderBy: {
            id: "asc"
        }
    });


    // Get achievements already unlocked by current user

    const unlockedAchievements =
        await prisma.userAchievement.findMany({

            where: {
                userId: userId
            },

            select: {
                achievementId: true,
                unlockedAt: true
            }
        });


    const unlockedMap = new Map(

        unlockedAchievements.map(item => [

            item.achievementId,

            item.unlockedAt

        ])
    );


    // --------------------------------------------------
    // ALL COMPLETED EXCHANGES FOR THIS USER
    // --------------------------------------------------

    const userExchanges = await prisma.exchange.findMany({

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
        },

        select: {

            senderId: true,

            receiverId: true,

            completedAt: true
        },

        orderBy: {

            completedAt: "asc"
        }
    });


    const totalExchanges = userExchanges.length;


    // --------------------------------------------------
    // UNIQUE EXCHANGE PARTNERS
    // --------------------------------------------------

    const uniquePartners = new Set();


    for (const exchange of userExchanges) {

        const partnerId =
            exchange.senderId === userId
                ? exchange.receiverId
                : exchange.senderId;

        uniquePartners.add(partnerId);
    }


    const friendsCount = uniquePartners.size;


    // --------------------------------------------------
    // USER SKILLS
    // --------------------------------------------------

    const userSkills = await prisma.userSkill.findMany({

        where: {
            userId: userId
        },

        select: {
            type: true
        }
    });


    const learnSkillsCount =
        userSkills.filter(
            skill => skill.type === "LEARN"
        ).length;


    const teachSkillsCount =
        userSkills.filter(
            skill => skill.type === "TEACH"
        ).length;


    // --------------------------------------------------
    // ACTIVE WEEKS
    // --------------------------------------------------

    const activeWeeks = new Set();


    for (const exchange of userExchanges) {

        if (!exchange.completedAt) {
            continue;
        }


        const date = new Date(exchange.completedAt);

        const year = date.getUTCFullYear();


        const firstDay = new Date(
            Date.UTC(year, 0, 1)
        );


        const dayOfYear =
            Math.floor(
                (date - firstDay) /
                (1000 * 60 * 60 * 24)
            );


        const weekNumber =
            Math.floor(dayOfYear / 7);


        activeWeeks.add(
            `${year}-${weekNumber}`
        );
    }


    const activeWeeksCount = activeWeeks.size;


    // --------------------------------------------------
    // ACHIEVEMENT PROGRESS
    // --------------------------------------------------

    const getProgress = (requirement) => {

        switch (requirement) {

            case "FIRST_EXCHANGE":

                return {
                    progress: Math.min(
                        totalExchanges,
                        1
                    ),
                    target: 1
                };


            case "FIVE_FRIENDS":

                return {
                    progress: Math.min(
                        friendsCount,
                        5
                    ),
                    target: 5
                };


            case "FIVE_EXCHANGES":

                return {
                    progress: Math.min(
                        totalExchanges,
                        5
                    ),
                    target: 5
                };


            case "TEN_EXCHANGES":

                return {
                    progress: Math.min(
                        totalExchanges,
                        10
                    ),
                    target: 10
                };


            case "THREE_LEARN_SKILLS":

                return {
                    progress: Math.min(
                        learnSkillsCount,
                        3
                    ),
                    target: 3
                };


            case "THREE_TEACH_SKILLS":

                return {
                    progress: Math.min(
                        teachSkillsCount,
                        3
                    ),
                    target: 3
                };


            case "THREE_ACTIVE_WEEKS":

                return {
                    progress: Math.min(
                        activeWeeksCount,
                        3
                    ),
                    target: 3
                };


            case "FIVE_SKILLS_LEARNED":

                return {
                    progress: Math.min(
                        learnSkillsCount,
                        5
                    ),
                    target: 5
                };


            case "FIVE_SKILLS_TAUGHT":

                return {
                    progress: Math.min(
                        teachSkillsCount,
                        5
                    ),
                    target: 5
                };


            case "TWENTY_FIVE_EXCHANGES":

                return {
                    progress: Math.min(
                        totalExchanges,
                        25
                    ),
                    target: 25
                };


            default:

                return {
                    progress: 0,
                    target: 0
                };
        }
    };


    const achievementData =
        achievements.map(achievement => {

            const unlocked =
                unlockedMap.has(achievement.id);


            const unlockedAt =
                unlockedMap.get(achievement.id) || null;


            const {
                progress,
                target
            } = getProgress(
                achievement.requirement
            );


            return {

                id: achievement.id,

                name: achievement.name,

                description:
                    achievement.description,

                xpReward:
                    achievement.xpReward,

                requirement:
                    achievement.requirement,

                unlocked,

                unlockedAt,

                progress,

                target
            };
        });


    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return res.status(200).json({

        month: startOfMonth.toISOString(),

        level: currentUser.level,

        currentUser: {

            ...currentUserEntry,

            xp: currentUser.xp

        },

        leaderboard,

        achievements: achievementData
    });
};


module.exports = {
    getLeaderboard
};
const { getLevelFromXP } = require("./xp");

const checkAchievements = async (userId, tx) => {

    const user = await tx.user.findUnique({
        where: {
            id: userId
        }
    });

    if (!user) {
        return [];
    }


    

    const completedExchanges = await tx.exchange.findMany({
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
        orderBy: {
            completedAt: "asc"
        }
    });


    const totalExchanges = completedExchanges.length;


    

    const uniquePartners = new Set(
        completedExchanges.map(exchange =>
            exchange.senderId === userId
                ? exchange.receiverId
                : exchange.senderId
        )
    );


    

    const userSkills = await tx.userSkill.findMany({
        where: {
            userId: userId
        }
    });


    const learnSkills = userSkills.filter(
        skill => skill.type === "LEARN"
    );

    const teachSkills = userSkills.filter(
        skill => skill.type === "TEACH"
    );



    const skillsActuallyLearned = new Set();
    const skillsActuallyTaught = new Set();


    for (const exchange of completedExchanges) {

        const partnerId =
            exchange.senderId === userId
                ? exchange.receiverId
                : exchange.senderId;


        const partnerSkills = await tx.userSkill.findMany({
            where: {
                userId: partnerId
            }
        });


        // Skills this user wants to learn
        const myLearnSkillIds = new Set(
            learnSkills.map(skill => skill.skillId)
        );


        // Skills this user can teach
        const myTeachSkillIds = new Set(
            teachSkills.map(skill => skill.skillId)
        );


        // Partner's skills
        const partnerTeachSkillIds = new Set(
            partnerSkills
                .filter(skill => skill.type === "TEACH")
                .map(skill => skill.skillId)
        );


        const partnerLearnSkillIds = new Set(
            partnerSkills
                .filter(skill => skill.type === "LEARN")
                .map(skill => skill.skillId)
        );



        for (const skillId of myLearnSkillIds) {

            if (partnerTeachSkillIds.has(skillId)) {
                skillsActuallyLearned.add(skillId);
            }
        }


        

        for (const skillId of myTeachSkillIds) {

            if (partnerLearnSkillIds.has(skillId)) {
                skillsActuallyTaught.add(skillId);
            }
        }
    }


   

    const activeWeeks = new Set();

    for (const exchange of completedExchanges) {

        if (!exchange.completedAt) {
            continue;
        }

        const date = new Date(exchange.completedAt);

        // Get Monday of that week
        const day = date.getUTCDay();

        const diff = day === 0 ? -6 : 1 - day;

        const monday = new Date(date);

        monday.setUTCDate(date.getUTCDate() + diff);

        const weekKey = monday
            .toISOString()
            .split("T")[0];

        activeWeeks.add(weekKey);
    }


    

    const conditions = {

        FIRST_EXCHANGE:
            totalExchanges >= 1,

        FIVE_FRIENDS:
            uniquePartners.size >= 5,

        FIVE_EXCHANGES:
            totalExchanges >= 5,

        TEN_EXCHANGES:
            totalExchanges >= 10,

        THREE_LEARN_SKILLS:
            learnSkills.length >= 3,

        THREE_TEACH_SKILLS:
            teachSkills.length >= 3,

        THREE_ACTIVE_WEEKS:
            activeWeeks.size >= 3,

        FIVE_SKILLS_LEARNED:
            skillsActuallyLearned.size >= 5,

        FIVE_SKILLS_TAUGHT:
            skillsActuallyTaught.size >= 5,

        TWENTY_FIVE_EXCHANGES:
            totalExchanges >= 25
    };


    

    const achievements = await tx.achievement.findMany({
        where: {
            requirement: {
                in: Object.keys(conditions)
            }
        }
    });


    

    const unlocked = await tx.userAchievement.findMany({
        where: {
            userId: userId
        },
        select: {
            achievementId: true
        }
    });


    const unlockedIds = new Set(
        unlocked.map(item => item.achievementId)
    );


    

    const newlyUnlocked = [];

    let totalAchievementXP = 0;


    for (const achievement of achievements) {

        const conditionMet =
            conditions[achievement.requirement];


        if (
            conditionMet &&
            !unlockedIds.has(achievement.id)
        ) {

            await tx.userAchievement.create({
                data: {
                    userId: userId,
                    achievementId: achievement.id
                }
            });


            newlyUnlocked.push(achievement);

            totalAchievementXP += achievement.xpReward;
        }
    }


    

    if (totalAchievementXP > 0) {

        const newXP =
            user.xp + totalAchievementXP;


        await tx.user.update({
            where: {
                id: userId
            },
            data: {
                xp: newXP,
                level: getLevelFromXP(newXP)
            }
        });
    }


    return newlyUnlocked;
};


module.exports = {
    checkAchievements
};
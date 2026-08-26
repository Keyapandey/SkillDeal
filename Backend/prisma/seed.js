require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({ adapter });


// ===============================
// SKILLS
// ===============================

const skills = [
    "3D Modeling",
    "Android Development",
    "Animation",
    "App Development",
    "Blogging",
    "C",
    "C++",
    "Canva",
    "Communication",
    "Content Writing",
    "Cybersecurity",
    "Data Analysis",
    "Data Structures & Algorithms",
    "Digital Marketing",
    "Excel",
    "Figma",
    "Finance",
    "Game Development",
    "Graphic Design",
    "HTML & CSS",
    "Java",
    "JavaScript",
    "Machine Learning",
    "Marketing",
    "Microsoft PowerPoint",
    "Music Production",
    "Node.js",
    "Photography",
    "Photoshop",
    "Python",
    "Public Speaking",
    "React",
    "SQL",
    "UI/UX Design",
    "Video Editing",
    "Web Development",
    "WordPress",
    "Writing",
    "Yoga",
    "YouTube"
];


// ===============================
// ACHIEVEMENTS
// ===============================

const achievements = [
    {
        name: "First Step",
        description: "Complete your first exchange",
        xpReward: 20,
        requirement: "FIRST_EXCHANGE"
    },
    {
        name: "Skill Connector",
        description: "Complete exchanges with 5 different people",
        xpReward: 40,
        requirement: "FIVE_FRIENDS"
    },
    {
        name: "Exchange Pro",
        description: "Complete 5 exchanges",
        xpReward: 50,
        requirement: "FIVE_EXCHANGES"
    },
    {
        name: "Exchange Master",
        description: "Complete 10 exchanges",
        xpReward: 100,
        requirement: "TEN_EXCHANGES"
    },
    {
        name: "Curious Learner",
        description: "Add 3 skills you want to learn",
        xpReward: 30,
        requirement: "THREE_LEARN_SKILLS"
    },
    {
        name: "Skilled Teacher",
        description: "Add 3 skills you can teach",
        xpReward: 30,
        requirement: "THREE_TEACH_SKILLS"
    },
    {
        name: "Consistent Learner",
        description: "Complete exchanges in 3 different weeks",
        xpReward: 60,
        requirement: "THREE_ACTIVE_WEEKS"
    },
    {
        name: "Skill Explorer",
        description: "Learn 5 different skills through exchanges",
        xpReward: 75,
        requirement: "FIVE_SKILLS_LEARNED"
    },
    {
        name: "Knowledge Sharer",
        description: "Teach 5 different skills through exchanges",
        xpReward: 75,
        requirement: "FIVE_SKILLS_TAUGHT"
    },
    {
        name: "SkillDeal Legend",
        description: "Complete 25 exchanges",
        xpReward: 200,
        requirement: "TWENTY_FIVE_EXCHANGES"
    }
];


// ===============================
// MAIN SEED FUNCTION
// ===============================

async function main() {

    // -------------------------------
    // Seed Skills
    // -------------------------------

    for (const name of skills) {

        await prisma.skill.upsert({
            where: {
                name: name
            },

            update: {},

            create: {
                name: name
            }
        });
    }

    console.log("Skills seeded successfully!");


    // -------------------------------
    // Seed Achievements
    // -------------------------------

    for (const achievement of achievements) {

        await prisma.achievement.upsert({
            where: {
                name: achievement.name
            },

            update: {},

            create: {
                name: achievement.name,
                description: achievement.description,
                xpReward: achievement.xpReward,
                requirement: achievement.requirement
            }
        });
    }

    console.log("Achievements seeded successfully!");
}


// ===============================
// RUN SEED
// ===============================

main()
    .catch((error) => {

        console.error(error);

        process.exit(1);

    })
    .finally(async () => {

        await prisma.$disconnect();

    });
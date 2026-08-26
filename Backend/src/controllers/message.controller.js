const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({ adapter });


const sendMessage = async (req, res) => {
    const senderId = req.user.userId;
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
        return res.status(400).json({
            message: "Receiver ID and message content are required"
        });
    }

    const receiver = await prisma.user.findUnique({
        where: {
            id: Number(receiverId)
        }
    });

    if (!receiver) {
        return res.status(404).json({
            message: "Receiver not found"
        });
    }

    const message = await prisma.message.create({
        data: {
            senderId,
            receiverId: Number(receiverId),
            content
        }
    });

    return res.status(201).json({
        message: "Message sent successfully",
        data: message
    });
};
const getMessages = async (req, res) => {
    const currentUserId = req.user.userId;
    const otherUserId = Number(req.params.userId);

    if (!otherUserId) {
        return res.status(400).json({
            message: "User ID is required"
        });
    }

    const messages = await prisma.message.findMany({
        where: {
            OR: [
                {
                    senderId: currentUserId,
                    receiverId: otherUserId
                },
                {
                    senderId: otherUserId,
                    receiverId: currentUserId
                }
            ]
        },
        orderBy: {
            createdAt: "asc"
        }
    });

    return res.status(200).json({
        messages
    });
};

const getConversations = async (req, res) => {
    const currentUserId = req.user.userId;

    const exchanges = await prisma.exchange.findMany({
        where: {
            status: "ACTIVE",
            OR: [
                {
                    senderId: currentUserId
                },
                {
                    receiverId: currentUserId
                }
            ]
        },
        include: {
            sender: {
    select: {
        id: true,
        name: true,
        college: true,
        year: true,
        skills: {
            include: {
                skill: true
            }
        }
    }
},
            receiver: {
    select: {
        id: true,
        name: true,
        college: true,
        year: true,
        skills: {
            include: {
                skill: true
            }
        }
    }
},
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    const conversations = exchanges.map((exchange) => {
        const otherUser =
            exchange.senderId === currentUserId
                ? exchange.receiver
                : exchange.sender;

        return {
            user: otherUser,
            exchangeId: exchange.id,
            scheduledAt: exchange.scheduledAt
        };
    });

    return res.status(200).json({
        conversations
    });
};


module.exports = {
    sendMessage,
    getMessages,
    getConversations
};
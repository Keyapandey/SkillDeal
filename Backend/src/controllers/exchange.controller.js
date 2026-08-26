const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { getLevelFromXP } = require("../utils/xp");
const { checkAchievements } = require("../utils/achievements");

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({ adapter });


const sendExchangeRequest = async (req, res) => {
    const { receiverId } = req.body;

    // 1. Check receiverId
    if (!receiverId) {
        return res.status(400).json({
            message: "receiverId is required"
        });
    }

    // 2. Get logged-in user's ID from JWT
    const senderId = req.user.userId;

    // 3. Prevent sending request to yourself
    if (senderId === Number(receiverId)) {
        return res.status(400).json({
            message: "You cannot send an exchange request to yourself"
        });
    }

    // 4. Check whether receiver exists
    const receiver = await prisma.user.findUnique({
        where: {
            id: Number(receiverId)
        }
    });

    if (!receiver) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    // 5. Check if a pending request already exists
    const existingRequest = await prisma.exchangeRequest.findFirst({
        where: {
            senderId: senderId,
            receiverId: Number(receiverId),
            status: "PENDING"
        }
    });

    if (existingRequest) {
        return res.status(409).json({
            message: "Exchange request already sent"
        });
    }

    // 6. Create exchange request
    const exchangeRequest = await prisma.exchangeRequest.create({
        data: {
            senderId: senderId,
            receiverId: Number(receiverId)
        }
    });

    return res.status(201).json({
        message: "Exchange request sent successfully",
        exchangeRequest
    });
};

const getIncomingRequests = async (req, res) => {
    const receiverId = req.user.userId;

    const requests = await prisma.exchangeRequest.findMany({
        where: {
    receiverId: receiverId,
    status: "PENDING"
},
        include: {
            sender: {
                select: {
                    id: true,
                    name: true,
                    college: true,
                    year: true,
                    branch: true
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    return res.status(200).json({
        requests
    });
};

const getSentRequests = async (req, res) => {
    const senderId = req.user.userId;

    const requests = await prisma.exchangeRequest.findMany({
        where: {
            senderId: senderId
        },
        include: {
            receiver: {
                select: {
                    id: true,
                    name: true,
                    college: true,
                    year: true,
                    branch: true
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    return res.status(200).json({
        requests
    });
};

const acceptExchangeRequest = async (req, res) => {
    const requestId = Number(req.params.id);

    if (!requestId) {
        return res.status(400).json({
            message: "Request ID is required"
        });
    }

    const receiverId = req.user.userId;

    const request = await prisma.exchangeRequest.findUnique({
        where: {
            id: requestId
        }
    });

    if (!request) {
        return res.status(404).json({
            message: "Exchange request not found"
        });
    }

    if (request.receiverId !== receiverId) {
        return res.status(403).json({
            message: "You cannot accept this request"
        });
    }

    if (request.status !== "PENDING") {
        return res.status(400).json({
            message: "This request has already been processed"
        });
    }
    const result = await prisma.$transaction(async (tx) => {
    const updatedRequest = await tx.exchangeRequest.update({
        where: {
            id: requestId
        },
        data: {
            status: "ACCEPTED"
        }
    });

    const exchange = await tx.exchange.create({
        data: {
            requestId: request.id,
            senderId: request.senderId,
            receiverId: request.receiverId
        }
    });

    return {
        updatedRequest,
        exchange
    };
});

    return res.status(200).json({
    message: "Exchange request accepted",
    exchangeRequest: result.updatedRequest,
    exchange: result.exchange
});
};

const declineExchangeRequest = async (req, res) => {
    const requestId = Number(req.params.id);

    if (!requestId) {
        return res.status(400).json({
            message: "Request ID is required"
        });
    }

    const receiverId = req.user.userId;

    const request = await prisma.exchangeRequest.findUnique({
        where: {
            id: requestId
        }
    });

    if (!request) {
        return res.status(404).json({
            message: "Exchange request not found"
        });
    }

    if (request.receiverId !== receiverId) {
        return res.status(403).json({
            message: "You cannot decline this request"
        });
    }

    if (request.status !== "PENDING") {
        return res.status(400).json({
            message: "This request has already been processed"
        });
    }

    const updatedRequest = await prisma.exchangeRequest.update({
        where: {
            id: requestId
        },
        data: {
            status: "DECLINED"
        }
    });

    return res.status(200).json({
        message: "Exchange request declined",
        exchangeRequest: updatedRequest
    });
};

const getMyExchanges = async (req, res) => {
    const userId = req.user.userId;

    const exchanges = await prisma.exchange.findMany({
        where: {
            OR: [
                {
                    senderId: userId
                },
                {
                    receiverId: userId
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
                    branch: true
                }
            },
            receiver: {
                select: {
                    id: true,
                    name: true,
                    college: true,
                    year: true,
                    branch: true
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    return res.status(200).json({
        exchanges
    });
};

const scheduleExchange = async (req, res) => {
    const exchangeId = Number(req.params.id);
    const userId = req.user.userId;
    const { scheduledAt } = req.body;

    if (!exchangeId) {
        return res.status(400).json({
            message: "Exchange ID is required"
        });
    }

    if (!scheduledAt) {
        return res.status(400).json({
            message: "Scheduled date and time are required"
        });
    }

    const exchange = await prisma.exchange.findUnique({
        where: {
            id: exchangeId
        }
    });

    if (!exchange) {
        return res.status(404).json({
            message: "Exchange not found"
        });
    }

    if (
        exchange.senderId !== userId &&
        exchange.receiverId !== userId
    ) {
        return res.status(403).json({
            message: "You are not part of this exchange"
        });
    }

    if (exchange.status !== "ACTIVE") {
        return res.status(400).json({
            message: "This exchange is not active"
        });
    }

    const updatedExchange = await prisma.exchange.update({
        where: {
            id: exchangeId
        },
        data: {
            scheduledAt: new Date(scheduledAt)
        }
    });

    return res.status(200).json({
        message: "Session scheduled successfully",
        exchange: updatedExchange
    });
};

const startSession = async (req, res) => {
    const exchangeId = Number(req.params.id);
    const userId = req.user.userId;

    if (!exchangeId) {
        return res.status(400).json({
            message: "Exchange ID is required"
        });
    }

    const exchange = await prisma.exchange.findUnique({
        where: {
            id: exchangeId
        }
    });

    if (!exchange) {
        return res.status(404).json({
            message: "Exchange not found"
        });
    }

    if (
        exchange.senderId !== userId &&
        exchange.receiverId !== userId
    ) {
        return res.status(403).json({
            message: "You are not part of this exchange"
        });
    }

    if (exchange.status !== "ACTIVE") {
        return res.status(400).json({
            message: "This exchange is not active"
        });
    }

    const updatedExchange = await prisma.exchange.update({
        where: {
            id: exchangeId
        },
        data: {
            sessionStartedAt: new Date()
        }
    });

    return res.status(200).json({
        message: "Session started",
        exchange: updatedExchange
    });
};

const endSession = async (req, res) => {
    const exchangeId = Number(req.params.id);
    const userId = req.user.userId;

    if (!exchangeId) {
        return res.status(400).json({
            message: "Exchange ID is required"
        });
    }

    const exchange = await prisma.exchange.findUnique({
        where: {
            id: exchangeId
        }
    });

    if (!exchange) {
        return res.status(404).json({
            message: "Exchange not found"
        });
    }

    if (
        exchange.senderId !== userId &&
        exchange.receiverId !== userId
    ) {
        return res.status(403).json({
            message: "You are not part of this exchange"
        });
    }

    if (exchange.status !== "ACTIVE") {
        return res.status(400).json({
            message: "This exchange is not active"
        });
    }

    if (!exchange.sessionStartedAt) {
        return res.status(400).json({
            message: "No active session found"
        });
    }

    const updatedExchange = await prisma.exchange.update({
        where: {
            id: exchangeId
        },
        data: {
            sessionEndedAt: new Date()
        }
    });

    return res.status(200).json({
        message: "Session ended successfully",
        exchange: updatedExchange
    });
};

const completeExchange = async (req, res) => {
    const exchangeId = Number(req.params.id);
    const userId = req.user.userId;

    if (!exchangeId) {
        return res.status(400).json({
            message: "Exchange ID is required"
        });
    }

    const exchange = await prisma.exchange.findUnique({
        where: {
            id: exchangeId
        }
    });

    if (!exchange) {
        return res.status(404).json({
            message: "Exchange not found"
        });
    }

    if (
        exchange.senderId !== userId &&
        exchange.receiverId !== userId
    ) {
        return res.status(403).json({
            message: "You are not part of this exchange"
        });
    }

    if (exchange.status !== "ACTIVE") {
        return res.status(400).json({
            message: "This exchange has already been processed"
        });
    }

    const XP_REWARD = 20;

    const result = await prisma.$transaction(async (tx) => {

        // 1. Complete the exchange
        const completedExchange = await tx.exchange.update({
            where: {
                id: exchangeId
            },
            data: {
                status: "COMPLETED",
                completedAt: new Date()
            }
        });


        // 2. Give both users 20 XP
        const sender = await tx.user.findUnique({
            where: {
                id: exchange.senderId
            }
        });

        const receiver = await tx.user.findUnique({
            where: {
                id: exchange.receiverId
            }
        });


        const senderXP = sender.xp + XP_REWARD;
        const receiverXP = receiver.xp + XP_REWARD;


        await tx.user.update({
            where: {
                id: sender.id
            },
            data: {
                xp: senderXP,
                level: getLevelFromXP(senderXP)
            }
        });


        await tx.user.update({
            where: {
                id: receiver.id
            },
            data: {
                xp: receiverXP,
                level: getLevelFromXP(receiverXP)
            }
        });


        // 3. Check achievements for both users
        const senderAchievements = await checkAchievements(
            sender.id,
            tx
        );

        const receiverAchievements = await checkAchievements(
            receiver.id,
            tx
        );


        // 4. Get final updated user data
        const updatedSender = await tx.user.findUnique({
            where: {
                id: sender.id
            }
        });

        const updatedReceiver = await tx.user.findUnique({
            where: {
                id: receiver.id
            }
        });


        return {
            completedExchange,
            updatedSender,
            updatedReceiver,
            senderAchievements,
            receiverAchievements
        };
    });


    return res.status(200).json({
        message: "Exchange completed successfully",

        exchange: result.completedExchange,

        users: {
            sender: {
                id: result.updatedSender.id,
                xp: result.updatedSender.xp,
                level: result.updatedSender.level,
                newAchievements: result.senderAchievements
            },

            receiver: {
                id: result.updatedReceiver.id,
                xp: result.updatedReceiver.xp,
                level: result.updatedReceiver.level,
                newAchievements: result.receiverAchievements
            }
        }
    });
};

module.exports = {
    sendExchangeRequest,
    getIncomingRequests,
    getSentRequests,
    acceptExchangeRequest,
    declineExchangeRequest,
    getMyExchanges,
    scheduleExchange,
    startSession,
    endSession,
    completeExchange
};
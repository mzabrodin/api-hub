import app from "./app.js";
import CONFIG from "./config.js";
import prisma from "./prisma/client.js";

const server = app.listen(CONFIG.port, () => {
    console.log(`Listening on port ${CONFIG.port}`);
});

async function shutdown() {
    server.close(async () => {
        await prisma.$disconnect();
    });
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

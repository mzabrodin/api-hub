import {PrismaPg} from "@prisma/adapter-pg";
import {PrismaClient} from "./generated/client.js";
import CONFIG from "../config.js";

const adapter = new PrismaPg({connectionString: CONFIG.databaseUrl});
export const prisma = new PrismaClient({adapter});

export default prisma;

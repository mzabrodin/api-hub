import type { JwtPayload } from "jsonwebtoken";
import {UserRole} from "../prisma/generated/enums.js";

interface JWT extends JwtPayload {
    id: string;
    email: string;
    role: UserRole;
}

declare global {
    namespace Express {
        interface Request {
            user?: JWT;
        }
    }
}

export default JWT;
import express from "express";
import cors from "cors";
import {Request, Response} from "express";
import {handleError} from "./middlewares/handleError.js";
import routeNotFound from "./middlewares/routeNotFound.js";
import CONFIG from "./config.js";

const app = express();

app.use(cors({origin: CONFIG.clientUrl}))
app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
    res.json({data: "Hello World!", timestamp: new Date().toISOString()});
})

app.use(routeNotFound);
app.use(handleError);

export default app;
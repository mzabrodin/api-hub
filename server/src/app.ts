import express from "express";
import {Request, Response} from "express";
import {handleError} from "./middlewares/handleError.js";
import routeNotFound from "./middlewares/routeNotFound.js";

const app = express();

app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
    res.send("Hello World!");
})

app.use(routeNotFound);
app.use(handleError);

export default app;
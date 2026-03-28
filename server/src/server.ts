import "dotenv/config";
import app from "./app.js"
import CONFIG from "./config.js";

const port = CONFIG.port;

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
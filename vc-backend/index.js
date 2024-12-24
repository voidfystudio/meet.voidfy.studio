import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import util from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
global.appRoot = path.resolve(__dirname);

dotenv.config();

const app = express()

app.use(morgan("combined"));

// Set up helmet for extra security
app.use(helmet());

app.post(
	"/webhook",

	express.raw({ type: "application/json" }),

	async (request, response) => {
        console.log("Webhook received");
        console.log(util.inspect(request, false, null, true));
        // console.log(util.inspect(response, false, null, true));
        console.log(util.inspect(request.body, false, null, true));
        console.log(util.inspect(request.headers, false, null, true));

        return response.status(200).end();
    }
);


app.use(express.json({ limit: "500mb" }));

// setup URL encoded parser middleware
app.use(express.urlencoded({
    extended: true
}));

app.get("/", (_request, response) => {
    return response.status(200).send("Home");
});

app.listen(process?.env?.PORT ?? 8000, () => {
    console.log(`Server is running on port ${process?.env?.PORT || 8000}`);
});
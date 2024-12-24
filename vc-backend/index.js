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

        console.log("Headers", JSON.stringify(request.headers))
        
        const signature = request.headers["x-jaas-signature"];
        
        const { _t, _v1 } = signature.split(",");
        
        const { t, v1 } = { t: _t.split("=")[1], v1:_v1.split("v1=", 2).at(1) };

        console.log({
            timestamp: t,
            signature: v1,
        });

        console.log("Raw Body", request.rawBody);
        console.log("Body", request.body);



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
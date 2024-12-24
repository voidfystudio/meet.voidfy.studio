import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import util from "node:util";
import path from "node:path";
import crypto from "node:crypto";
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
        
        const header = request.headers["x-jaas-signature"];
        const elements = header.split(","); 
        const timestampElement = elements.find(el => el.startsWith("t=")); 
        const signatureElement = elements.find(el => el.startsWith("v1=")); 
        const timestamp = timestampElement.split("=")[1]; 
        const signature = signatureElement.split("=")[1];
        const payload = request.body.toString(); 
        const signedPayload = `${timestamp}.${payload}`;

        const SECRET = `whsec_dac2b21a74144c56a7ce482c07664fad`;
        const hmac = crypto.createHmac("sha256", SECRET)
        hmac.update(signedPayload, "utf-8");

        const expectedSignature = hmac.digest("base64");


        console.log({
            signature,
            expectedSignature,
            payload,
            b: request.body.toString('utf-8'),
        })

        try {

            let r = JSON.parse(request.body.toString('utf-8'));

            console.log({

                payload: r
            });
        } catch (err) {
            console.error(err);
        }
        
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
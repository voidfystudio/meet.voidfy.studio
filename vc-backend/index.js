import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import util from "node:util";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

import tsscmp from "tsscmp";

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
		const signature = signatureElement.split("v1=")[1];
		const payload = request.body.toString();
		const signedPayload = `${timestamp}.${payload}`;

		const SECRET = process.env.JAAS_WEBHOOK_SECRET;
		const hmac = crypto.createHmac("sha256", SECRET)
		hmac.update(signedPayload, "utf-8");

		const expectedSignature = hmac.digest("base64");


		if (tsscmp(expectedSignature, signature) === false) {
			console.error("Webhook Error: Signatures do not match with what is required", expectedSignature, signature);
			return response.status(400).send(`Webhook Error: Signatures do not match with what is required`);
		}

		const currentTimestamp = Math.floor(Date.now());
		const recievedTimestamp = Math.floor(parseInt(timestamp, 10));

		const tolerance = 2 * 60

		if (Math.abs(currentTimestamp - recievedTimestamp) > tolerance) {
			console.error("Webhook Error: Timestamp is outside of the tolerance window", currentTimestamp, recievedTimestamp, Math.abs(currentTimestamp - recievedTimestamp));
			return response.status(400).send(`Webhook Error: Timestamp is outside of the tolerance window`);
		}

		// Implement your webhook logic here

		const data = JSON.parse(payload);

		if (!data) {
			// Cannot do anything with this data
			return;
		}

		// FIXME: Idempotency key check


		// TODO: Doing the SETTINGS_PROVISIONING HERE


		const { eventType, fqn, idempotencyKey, data: eventData } = data;

		if (eventType !== "SETTINGS_PROVISIONING") {
			response.status(200).end();
		}

		console.log({
			eventData,
			fqn,
			idempotencyKey,
			eventData,
		});

		switch (eventType) {
			case "SETTINGS_PROVISIONING":

				// TODO: Some real stuff here.

				return response.status(200).json({
					"lobbyEnabled": true,
					"passcode": "0000",
					"lobbyType": "WAIT_FOR_APPROVAL",
					"transcriberType": "GOOGLE"
				})
			default:
				break;
		}
		
		return;
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

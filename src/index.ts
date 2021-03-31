import { config } from "dotenv";
import mongoose from "mongoose";

import { Inscriber } from "@koreanpanda/inscriber";

import { Magneton } from "./Magneton";

config();
export const client = new Magneton();
export const logger = new Inscriber();

// Mongoose Connection.
mongoose.connect(process.env.MONGOOSE_CONNECTION_URL as string, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: true,
});

const init = async () => {
	client.changeState("Production");
	await client.loadFiles();
	await client.runEvents();
	client.login(process.env.TOKEN as string);
};

init().catch((error) => {
	console.error(error);
});

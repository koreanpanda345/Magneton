import { config } from "dotenv";
import {Magneton} from "./Magneton";
import mongoose from "mongoose";
import UpdateDoc from "./database/UpdateSchema";
config();

mongoose.connect(process.env.MONGOOSE_CONNECTION_URL as string, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: true
});

UpdateDoc.create({
	id: 1,
	date: "2/26/2021",
	title: "Update Command",
	description: "This is a test.",
	type: "update"
});

const client = new Magneton();
client.start("production");
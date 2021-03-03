import { config } from "dotenv";
import {Magneton} from "./Magneton";
import mongoose from "mongoose";
config();

// Mongoose Connection.
mongoose.connect(process.env.MONGOOSE_CONNECTION_URL as string, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: true
});

const client = new Magneton();
client.start("production");
import mongoose, { Document } from "mongoose";
const Schema = mongoose.Schema;

export interface ISettings extends Document {
	serverId: string;
	prefix: string;
}

const settingsSchema = new Schema({
	serverId: String,
	prefix: String,
});

export default mongoose.model<ISettings>("Config", settingsSchema);

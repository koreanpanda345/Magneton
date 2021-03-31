import mongoose, { Document } from "mongoose";

const Schema = mongoose.Schema;

export interface ITeamStorage extends Document {
	userId: string;
	teams: { name: string; team: string[] }[];
}

const teamStorageSchema = new Schema({
	userId: String,
	teams: [{ name: String, team: [String] }],
});

export default mongoose.model<ITeamStorage>("TeamStorage", teamStorageSchema);

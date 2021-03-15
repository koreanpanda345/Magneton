import mongoose, { Document } from "mongoose";
import { client } from "..";
const Schema = mongoose.Schema;

export interface IDraftTimer extends Document {
	serverId: string;
	channelId: string;
	timer: number;
	players: {
		userId: string;
		skips: number;
		pokemon: string[];
		order: number;
		queue: string[];
		done: boolean;
	}[];
	maxRounds: number;
	totalSkips: number;
	currentPlayer: string;
	round: number;
	direction: string;
	pokemon: string[];
	prefix: string;
	leagueName: string;
	sheetId: string;
	pause: boolean;
	modes: {
		dm: boolean;
		skips: boolean;
		text: boolean;
	};
}

const draftTimerSchema = new Schema({
	serverId: String,
	channelId: String,
	timer: Number,
	players: [
		{
			userId: String,
			skips: Number,
			pokemon: [String],
			order: Number,
			queue: [String],
			done: Boolean,
		},
	],
	round: Number,
	maxRounds: Number,
	totalSkips: Number,
	currentPlayer: String,
	direction: String,
	pokemon: [String],
	prefix: String,
	leagueName: String,
	sheetId: String,
	pause: Boolean,
	modes: {
		dm: Boolean,
		skips: Boolean,
		text: Boolean,
	},
});

export default mongoose.model<IDraftTimer>("DraftTimer", draftTimerSchema);

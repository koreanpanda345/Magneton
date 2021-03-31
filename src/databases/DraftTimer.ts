import mongoose, { Document } from "mongoose";

const Schema = mongoose.Schema;

// export interface IDraftTimer extends Document {
// 	serverId: string;
// 	channelId: string;
// 	timer: number;
// 	players: {
// 		userId: string;
// 		skips: number;
// 		pokemon: string[];
// 		order: number;
// 		queue: string[];
// 		done: boolean;
// 	}[];
// 	maxRounds: number;
// 	totalSkips: number;
// 	currentPlayer: string;
// 	round: number;
// 	direction: string;
// 	pokemon: string[];
// 	prefix: string;
// 	leagueName: string;
// 	sheetId: string;
// 	pause: boolean;
// 	modes: {
// 		dm: boolean;
// 		skips: boolean;
// 		text: boolean;
// 	};
// 	tiers: {
// 		tier: number;
// 		pokemon: string[];
// 	}[];
// }

// const draftTimerSchema = new Schema({
// 	serverId: String,
// 	channelId: String,
// 	timer: Number,
// 	players: [
// 		{
// 			userId: String,
// 			skips: Number,
// 			pokemon: [String],
// 			order: Number,
// 			queue: [String],
// 			done: Boolean,
// 		},
// 	],
// 	round: Number,
// 	maxRounds: Number,
// 	totalSkips: Number,
// 	currentPlayer: String,
// 	direction: String,
// 	pokemon: [String],
// 	prefix: String,
// 	leagueName: String,
// 	sheetId: String,
// 	pause: Boolean,
// 	modes: {
// 		dm: Boolean,
// 		skips: Boolean,
// 		text: Boolean,
// 	},
// 	tiers: [
// 		{
// 			tier: Number,
// 			pokemon: [String],
// 		},
// 	],
// });

export interface IDraftPlayer {
	user_id: string;
	username: string;
	order: number;
	done: boolean;
	pokemon: string[];
	skips: number;
	auto_skip: boolean;
	queue: string[];
}

export interface IDraftTimer extends Document {
	server_id: string;
	channel_id: string;
	pokemons: string[];
	tiers: {
		tier: number;
		pokemon: string[];
	}[];
	timer: number;
	players: IDraftPlayer[];
	current_player: string;
	max_rounds: number;
	total_skips: number;
	sheet_id: string;
	direction: string;
	round: number;
	prefix: string;
	league_name: string;
	pause: boolean;
	modes: {
		dm: boolean;
		skips: boolean;
		text: boolean;
	};
}
const draftTimerSchema = new Schema({
	server_id: String,
	channel_id: String,
	pokemons: [String],
	tierss: [
		{
			tier: Number,
			pokemon: [String],
		},
	],
	timer: Number,
	players: [
		{
			user_id: String,
			username: String,
			order: Number,
			done: Boolean,
			pokemon: [String],
			skips: Number,
			autho_skip: Boolean,
			queue: [String],
		},
	],
	current_player: String,
	max_rounds: Number,
	total_skips: Number,
	sheet_id: String,
	direction: String,
	round: Number,
	prefix: String,
	league_name: String,
	pause: Boolean,
	modes: {
		dm: Boolean,
		skips: Boolean,
		text: Boolean,
	},
});
export default mongoose.model<IDraftTimer>("DraftTimer", draftTimerSchema);

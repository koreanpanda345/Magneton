import {SelectResult} from "airtable";

export type DraftData = {
	"League Prefix": string;
	"League Name": string;
	"Max Rounds": number;
	"Total Skips": number;
	"Pokemon": string;
	"Current Player": string;
	"Players": string;
	"Server Id": string;
	"Channel Id": string;
};

export type ServerData = {
	"Server Id": string;
	"Prefix": string;
	"Language": string;
};

export interface Database {
	name: string;
	get: (filter: string) => Promise<SelectResult<DraftData | ServerData>>;
	update?: (recordId: string, data: DraftData | ServerData) => boolean | Promise<boolean>;
	delete?: (recordId: string) => boolean | Promise<boolean>;
	create?: (data: DraftData | ServerData) => boolean | Promise<boolean>;
}
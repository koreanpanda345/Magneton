import type {Message, Permission} from "discordeno";

export interface Monitor {
	name: string;
	ignore?: {
		bots?: boolean;
		others?: boolean;
		edits?: boolean;
		dm?: boolean;
	}

	permissions?: {
		server?: {
			self?: Permission[],
			user?: Permission[]
		},
		channel?: {
			self?: Permission[],
			user?: Permission[]
		}
	}

	invoke: (message: Message) => unknown;
}
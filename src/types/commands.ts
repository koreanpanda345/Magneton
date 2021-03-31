import {
	Channel,
	Collection,
	Guild,
	GuildMember,
	Message,
	PermissionString,
	TextChannel,
	User,
} from "discord.js";

export interface Command {
	name: string;
	hidden?: boolean;
	aliases?: string[];
	description?: string;
	permissions?: {
		user?: PermissionString[];
		self?: PermissionString[];
	};
	usages?: string[];
	subcommands?: Collection<string, Command>;
	preconditions?: ((ctx: CommandContext) => boolean)[];
	invoke: (ctx: CommandContext, otherCommandData?: unknown) => Promise<unknown>;
}

export class CommandContext {
	private _guild: Guild | null;
	private _guildId: string | undefined;
	private _channel: Channel;
	private _channelId: string;
	private _user: User;
	private _userId: string;
	private _member: GuildMember | null;
	constructor(private _message: Message, private _args: string[]) {
		this._guild = _message.guild;
		this._guildId = this._guild?.id;
		this._channel = _message.channel;
		this._channelId = this._channel.id;
		this._user = _message.author;
		this._userId = this._user.id;
		this._member = _message.member;
	}

	//#region Getters
	public get message() {
		return this._message;
	}
	public get args() {
		return this._args;
	}
	public get guild() {
		return this._guild;
	}
	public get guildId() {
		return this._guildId;
	}
	public get channel() {
		return this._channel;
	}
	public get channelId() {
		return this._channelId;
	}
	public get user() {
		return this._user;
	}
	public get userId() {
		return this._userId;
	}
	public get member() {
		return this._member;
	}
	//#endregion

	public sendMessage(content: any) {
		return (this._channel as TextChannel).send(content);
	}
}

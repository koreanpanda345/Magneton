import { Guild, Channel, User, GuildMember, Message, TextChannel } from "discord.js";
import { Magneton } from "../Magneton";

/**
 * The CommandContext class's purpose is to make it easier passing
 * variables through, as one type. It also is to make short cuts for 
 * necessary things.
 */
export class CommandContext {
	// We make variables private, so we change their read/write permission to be read only.
	// This is done by using the get keyword starting at line 39.
	private _guild: Guild | null;
	private _guildId: string | undefined;
	private _channel: Channel;
	private _channelId: string;
	private _user: User;
	private _userId: string;
	private _member: GuildMember | null;
	private _me: GuildMember | undefined | null;
	constructor(
		private _message: Message,
		private _args: string[],
		private _client: Magneton
	){
		this._guild = this._message.guild;
		this._guildId = this._guild?.id;
		this._channel = this._message.channel;
		this._channelId = this._channel.id;
		this._user = this._message.author;
		this._userId = this._user.id;
		this._member = this._message.member;
		this._me = this._guild?.me;
	}
	/**
	 * Short cut for sending message.
	 * @param content - Content that we want to send to the channel.
	 */
	public sendMessage(content: any) {
		return (this.channel as TextChannel).send(content);
	}

	public get message() { return this._message; }
	public get args() { return this._args; }
	public get client() { return this._client; }
	public get guild() { return this._guild; }
	public get guildId() { return this._guildId; }
	public get channel() { return this._channel; }
	public get channelId() { return this._channelId; }
	public get user() { return this._user; }
	public get userId() { return this._userId; }
	public get member() { return this._member; }
	public get me() { return this._me; }
}
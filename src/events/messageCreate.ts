import {
	Message,
	ChannelTypes,
	botID,
	hasChannelPermissions,
	Permission,
	memberIDHasPermission,
	botHasChannelPermissions,
	botHasPermission
} from "discordeno";
import {botCache} from "../../cache.ts";
import { Monitor } from "../types/monitors.ts";

botCache.eventHandlers.messageCreate = async (message: Message) => {
	
	botCache.monitors.forEach(async (monitor: Monitor) => {
		if(monitor?.ignore?.bots !== false && message.author.bot) return;

		if(monitor?.ignore?.dm !== false && message.channel?.type === ChannelTypes.DM) return;

		if(monitor?.ignore?.edits && message.editedTimestamp) return;
		if(monitor?.ignore?.others && message.author.id !== botID) return;
		
		//#region Permission Checks
		let permissionCheck = () => {
			return (
				monitor.permissions?.server?.self &&
				monitor.permissions?.server?.user &&
				monitor.permissions?.channel?.self &&
				monitor.permissions?.channel?.user
			);
		}
		if(!permissionCheck) return monitor.invoke(message);

		if(!message.guild) return;

		if(monitor.permissions?.channel?.user) {
			const results = await Promise.all(monitor.permissions?.channel?.user?.map((perm: Permission) => hasChannelPermissions(message.author.id, message.guildID, [perm])));
			if(results.includes(false)) return;
		}

		if(monitor.permissions?.server?.user && !(await memberIDHasPermission(message.author.id, message.guildID, monitor.permissions?.server?.user!))) return;
		
		if(monitor.permissions?.channel?.self && !(await botHasChannelPermissions(message.guildID, monitor.permissions?.channel?.self!))) return;

		if(monitor.permissions?.server?.self && !(await botHasPermission(message.guildID, monitor.permissions.server.self))) return;
		//#endregion

		return monitor.invoke(message);
	});
}
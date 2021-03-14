import { createEvent } from "../../utils/helpers";
import { Message, PermissionString, User } from "discord.js";
import { client, logger } from "../..";
import { CommandContext } from "../../types/commands";
import { parseCommand, parsePrefix } from "../../monitors/commandHandler";

createEvent({
	name: "message",
	invoke: async (message: Message) => {
		client.cache.monitors.forEach((monitor) => {
			monitor.invoke(message);
		});
	},
});

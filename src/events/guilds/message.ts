import { Message, PermissionString, User } from "discord.js";

import { client, logger } from "../..";
import { parseCommand, parsePrefix } from "../../monitors/commandHandler";
import { CommandContext } from "../../types/commands";
import { createEvent } from "../../utils/helpers";

createEvent({
	name: "message",
	invoke: async (message: Message) => {
		client.cache.monitors.forEach((monitor) => {
			monitor.invoke(message);
		});
	},
});

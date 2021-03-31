import { client, logger } from "../..";
import { createEvent } from "../../utils/helpers";

createEvent({
	name: "ready",
	invoke: async () => {
		logger.info(`${client.user?.username} is online.`);
		client.user?.setStatus(client.status);
		client.user?.setActivity(
			`In ${client.guilds.cache.size} Servers | Currently Running ${client.cache.drafts.size} Drafts.`
		);
		logger.info(`Loaded ${client.cache.commands.size} Commands.`);
	},
});

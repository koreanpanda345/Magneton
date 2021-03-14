import { createEvent } from "../../utils/helpers";
import { client, logger } from "../..";

createEvent({
	name: "ready",
	invoke: async () => {
		logger.info(`${client.user?.username} is online.`);
		client.user?.setStatus(client.status);
		logger.info(`Loaded ${client.cache.commands.size} Commands.`);
	},
});

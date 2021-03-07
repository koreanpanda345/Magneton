import { createCommand } from "../../utils/helpers.ts";


createCommand({
	name: "ping",
	description: "commands/ping:DESCRIPTION",
	permissions: {
		channel: {
			self: ["SEND_MESSAGES"]
		}
	},
	invoke: (message) => {
		message.send(`Ping MS: ${Date.now() - message.timestamp}ms`);
	} 
});
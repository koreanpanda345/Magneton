import {Message} from "discordeno";
import {botCache} from "../../cache.ts";

botCache.monitors.set("messageCollector", {
	name: "messageCollector",

	invoke: async (message: Message) => {
		const collector = botCache.messageCollectors.get(message.author.id);

		if(!collector || message.channelID) return;
		if(!collector.filter(message)) return;

		if(collector.amount === 1 || collector.amount === collector.message.length + 1) {
			botCache.messageCollectors.delete(message.author.id);
			return collector.resolve([...collector.messages, message]);
		}

		collector.messages.push(message);
	}
})
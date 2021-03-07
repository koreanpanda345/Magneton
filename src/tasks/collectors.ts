import {botCache} from "../../cache.ts";
import {Milliseconds} from "../utils/constants/time.ts";

botCache.tasks.set("collector", {
	name: "collector",
	interval: Milliseconds.MINUTE,
	invoke: async () => {
		const now = Date.now();

		botCache.messageCollectors.forEach((collector, key) => {

			if((collector.createdAt + collector.duration) > now) return;

			botCache.messageCollectors.delete(key);
			return collector.reject();
		});
	}
})
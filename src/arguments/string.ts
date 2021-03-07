import {botCache} from "../../cache.ts";

botCache.arguments.set("string", {
	name: "string",
	invoke: (argument, parameters) => {
		const [text] = parameters;

		const valid = argument.literals?.length && text ?
			argument.literals?.includes(text.toLowerCase()) ?
				text :
				undefined
			:text;
		
		if(valid) return argument.lowercase ? valid.toLowerCase() : valid;
	}
})
import {createCommand, createSubcommand} from "../../utils/helpers.ts";
import {needMessage} from "../../utils/collectors.ts";


createCommand({
    name: "prefix",
    description: "Allows you to reset the prefix, or change it.",
    arguments: [
        {
            name: "subcommand",
            type: "string",
            required: false,
        },
        {
            name: "new prefix",
            type: "string",
            required: false
        }
    ],
    invoke: async (message, args: PrefixArguments, guild) => {
        if(args.subcommand.toLowerCase().trim() === "reset") {

        }
        else if(args.subcommand.toLowerCase().trim() === "set") {
            let prefix = "";
            if(typeof args.prefix === "undefined") {
                message.channel?.send("What would you like the prefix to be?");
                let result = await needMessage(message.author.id, message.channelID, {
                    amount: 1
                });
                prefix = result.content;
            }
            else prefix = args.prefix;

            message.channel?.send(`${prefix}`);
        }
    }
});

interface PrefixArguments {
    subcommand: string;
    prefix?: string;
}
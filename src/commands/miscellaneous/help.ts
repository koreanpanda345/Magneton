
import { botCache } from "../../../cache.ts";
import { translate } from "../../utils/i18next.ts";
import { Embed } from "../../utils/Embed.ts";
import { createCommand } from "../../utils/helpers.ts";

createCommand({
    name: `help`,
    arguments: [
        {
            name: "command",
            type: "string",
            lowercase: true,
            required: false,
        },
    ],
    description: "Displays information about a command.",
    //@ts-ignore
    invoke: function (message, args: HelpArgs) {
        if (!args.command) {
            return message.send(`No command provided.`);
        }

        const command = botCache.commands.get(args.command);
        if (!command) {
            return message.send(`Command ${args.command} not found.`);
        }

        const description = translate(
            message.guildID!,
            `commands/${args.command}:DESCRIPTION`,
        );

        const embed = new Embed()
            .setAuthor(
                translate(message.guildID!, `commands/help:AUTHOR`, {
                    name: args.command,
                }),
            )
            .setDescription(
                description === "DESCRIPTION" ? command.description : description,
            );

        return message.send({ embed });
    },
});

interface HelpArgs {
    command?: string;
}
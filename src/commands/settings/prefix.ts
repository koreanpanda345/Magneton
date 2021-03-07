import {createCommand, createSubcommand} from "../../utils/helpers.ts";


createCommand({
    name: "prefix",
    description: "Allows you to reset the prefix, or change it.",
    arguments: [
        {
            name: "subcommmand",
            type: "subcommand",
            required: false,
        },
    ],
    invoke: (message, args, guild,) => {
        message.channel?.send("To reset the prefix do `m!prefix reset, and to set a new prefix, do `m!prefix set <prefix>`");
    }
});

createSubcommand("prefix", {
    name: "set",
    arguments: [
        {
            name: "prefix",
            type: "string",
            required: true,
            missing: (message) => {
                message.reply(`Please provide a prefix`);
            },
        },
    ],
    description: "Sets the prefix",
    invoke: (message, args, guild) => {
        message.channel?.send("Success");
    }
})
import {createCommand} from "../../utils/helpers.ts";
import {needMessage} from "../../utils/collectors.ts";
import {DraftData} from "../../types/databases.ts";
import {Embed} from "../../utils/Embed.ts";
import {draftTimer} from "../../../mod.ts";

createCommand({
    name: "setdraft",
    aliases: ["setup"],
    description: "Sets up the draft.",

    invoke: async (message, args, guild) => {
        let data = {} as DraftData;
        const embed = new Embed();

        embed.setTitle("Draft Timer Setup.");
        embed.setDescription("What is your league's name?");

        let msg = await message.send({embed});

        let step = await needMessage(message.author.id, message.channelID, {
            amount: 1
        });
        if(step.content.toLowerCase().trim() === "m!cancel") return message.reply("Canceling");
        data["League Name"] = step.content;
        embed.description = `League Name: \`${data["League Name"]}\`\nWhat is your league's prefix?`;
        msg?.edit({embed});
        step = await needMessage(message.author.id, message.channelID, {
            amount: 1
        });
        if(step.content.toLowerCase().trim() === "m!cancel") return message.reply("Canceling");
        data["League Prefix"] = step.content;
        embed.description = `League Name: \`${
            data["League Name"]
        }\`\nLeague Prefix: \`${
            data["League Prefix"]
        }\`What is the max rounds?`;

        msg?.edit({embed});
        step = await needMessage(message.author.id, message.channelID, {
            amount: 1
        });
        if(step.content.toLowerCase().trim() === "m!cancel") return message.reply("Canceling");
        data["Max Rounds"] = Number(step.content);
        embed.description = `League Name: \`${
            data["League Name"]
        }\`\nLeague Prefix: \`${
            data["League Prefix"]
        }\`\nMax Rounds: \`${
            data["Max Rounds"]
        }\`\nWhat is the total amount of skips a player can have before they go on auto skip?`;
        msg?.edit({embed});
        step = await needMessage(message.author.id, message.channelID, {
            amount: 1
        });
        if(step.content.toLowerCase().trim() === "m!cancel") return message.reply("Canceling");
        data["Total Skips"] = Number(step.content);
        embed.description = `League Name: \`${
            data["League Name"]
        }\`\nLeague Prefix: \`${
            data["League Prefix"]
        }\`\nMax Rounds: \`${
            data["Max Rounds"]
        }\`\nTotal Skips: \`${
            data["Total Skips"]
        }\`\nDoes this look correct?`;
        msg?.edit({embed});
        step = await needMessage(message.author.id, message.channelID, {
            amount: 1
        });
        if(step.content.toLowerCase().trim() === "m!cancel") return message.reply("Canceling");
        if(step.content.toLowerCase().trim() === "yes") {
            console.log(data);
        }


    }
})
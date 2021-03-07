import {createCommand} from "../../utils/helpers.ts";
import {needMessage} from "../../utils/collectors.ts";
import {DraftData} from "../../types/databases.ts";
import {Embed} from "../../utils/Embed.ts";
import { Member, Message } from "discordeno";
import {botCache} from "../../../cache.ts";

createCommand({
    name: "setdraft",
    aliases: ["setup"],
    description: "Sets up the draft.",

    invoke: async (message, args, guild) => {
        let data = {
            "Players": ""
        } as DraftData;
        let embed = new Embed();
        const messagesToDelete: Message[] = [];

        embed.setTitle("Draft Timer Setup.");
        embed.setDescription("What is your league's name?");

        let msg = await message.send({embed});
        messagesToDelete.push(msg);
        //@ts-ignore
        let step;
        while(true) {
            step = await needMessage(message.author.id, message.channelID, {
                amount: 1
            });
            messagesToDelete.push(step);
            if(step.content.toLowerCase().trim() === "m!cancel") {
                for(const _msg of messagesToDelete) {
                    await _msg.delete();
                }
                return message.channel?.send("Canceling");
            }

            let result = await botCache.databases.draft.select<DraftData>({fields: ["League Name"]});
            //@ts-ignore
            if(result.records.find(x => x.fields["League Name"].toLowerCase().trim() === step.content.toLowerCase().trim())) {
                messagesToDelete.push(await message.reply("That name is already taken."));
            }

            else {
                data["League Name"] = step.content;
                embed.description = `League Name: \`${data["League Name"]}\`\nWhat is your league's prefix?`;
                msg?.edit({embed});
                break;
            }
        }
        while(true) {
            step = await needMessage(message.author.id, message.channelID, {
                amount: 1
            });

            messagesToDelete.push(step);
            if(step.content.toLowerCase().trim() === "m!cancel") {
                for(const _msg of messagesToDelete) {
                    await _msg.delete();
                }
                return message.channel?.send("Canceling");
            }
            let result = await botCache.databases.draft.select<DraftData>({fields: ["League Prefix"]});
            if(step.content.toLowerCase().trim() === "m!")
                messagesToDelete.push(await message.reply("That is the bot's prefix. Please use a different one."));
            //@ts-ignore
            else if(result.records.find(x => x.fields["League Prefix"] === step.content.toLowerCase().trim())) {
                messagesToDelete.push(await message.reply("That prefix is already taken."));
            }
            else {
                data["League Prefix"] = step.content.toLowerCase().trim();
                embed.description = `League Name: \`${
                    data["League Name"]
                }\`\nLeague Prefix: \`${
                    data["League Prefix"]
                }\`\nWhat is the max rounds?`;
                msg?.edit({embed});
                break;
            }
        }

        step = await needMessage(message.author.id, message.channelID, {
            amount: 1
        });
        messagesToDelete.push(step);
        if(step.content.toLowerCase().trim() === "m!cancel") {
            for(const _msg of messagesToDelete) {
                await _msg.delete();
            }
            return message.channel?.send("Canceling");
        }
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
        messagesToDelete.push(step);
        if(step.content.toLowerCase().trim() === "m!cancel") {
            for(const _msg of messagesToDelete) {
                await _msg.delete();
            }
            return message.channel?.send("Canceling");
        }
        data["Total Skips"] = Number(step.content);
        embed.description = `League Name: \`${
            data["League Name"]
        }\`\nLeague Prefix: \`${
            data["League Prefix"]
        }\`\nMax Rounds: \`${
            data["Max Rounds"]
        }\`\nTotal Skips: \`${
            data["Total Skips"]
        }\`\nPlease add your players, either by their id, or by ping them.`;
        msg?.edit({embed});
        while(true) {
            step = await needMessage(message.author.id, message.channelID, {
                amount: 1
            });
            messagesToDelete.push(step);
            if(step.content.toLowerCase().trim() === "m!cancel") {
                for(const _msg of messagesToDelete) {
                    await _msg.delete();
                }
                return message.channel?.send("Canceling");
            }
            if(step.content.toLowerCase().trim() === "save") break;
            if((step.mentionedMembers as Member[]).length == 0) {
                messagesToDelete.push(await message.reply("you must ping the user(s)."));
            }
            else {
                let members = step.mentionedMembers as Member[]
                for(const member of members) {
                    embed.addField(`Player: ${member.username}`,`Order: ${embed.fields.length + 1}`);
                    data["Players"] += `\n`+
                        `|-player|${member.username}\n` +
                        `\t|-order|${embed.fields.length}\n` +
                        `\t|-pokemon|\n`;
                    msg?.edit({embed});
                }
            }
        }
        data.Players = data.Players.trim();
        botCache.databases.draft.create<DraftData>([data]).then(async () => {
            embed = new Embed();
            embed.setTitle("Draft has been setup!");
            embed.setDescription("To start the draft, type `m!startdraft`");
            msg?.edit({embed});
        })

        console.log(data);


    }
})
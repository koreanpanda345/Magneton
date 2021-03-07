import {createCommand} from "../../utils/helpers.ts";
import {botCache} from "../../../cache.ts";
import {DraftData} from "../../types/databases.ts";
import {Embed} from "../../utils/Embed.ts";


createCommand({
    name: "draft",
    arguments: [
        {
            name: "league prefix",
            required: true,
            missing: (message) => {
                return message.reply("Please try this command again, but provide the league prefix.");
            },
            type: "string"
        }
    ],
    description: "Displays the current draft by the league's prefix.",

    invoke: async (message, args: DraftArguments, guild) => {
      let result = await botCache.databases.draft.select<DraftData>({filterByFormula: `{League Prefix} = "${args.prefix}"`});
      const draft = result.records[0];

      const embed = new Embed();
      embed.setTitle(`${draft.fields["League Name"]}`);
      embed.setDescription(`Prefix: ${draft.fields["League Prefix"]}`);
      message.channel?.send({embed});
    }
});

interface DraftArguments {
    prefix: string;
}
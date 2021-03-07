import {botCache} from "../../cache.ts";
import {cache, getMember} from "discordeno";

botCache.arguments.set("member", {
    name: "member",
    //@ts-ignore
    invoke: async (_argument, parameters, message) =>{
        const [id] = parameters;
        if (!id) return;

        const guild = cache.guilds.get(message.guildID);
        if (!guild) return;

        const userID = id.startsWith("<@") ?
            id.substring(id.startsWith("<@!") ? 3 : 2, id.length - 1) :
            id;

        const cachedMember = guild.members.get(userID);
        if (cachedMember) return cachedMember;

        return await getMember(guild.id, userID)
            .catch(() => undefined);
    }
});
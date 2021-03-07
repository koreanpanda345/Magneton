import { botCache } from "../../cache.ts";

export async function loadLanguages() {
    const guilds = await botCache.databases.server.select();

    if(guilds.records.length === 0) return;

    for(const guild of guilds) {
        if(!guild.Langauge) continue;
        botCache.guildLanguages.set(guild.id, guild.Language);
    }
}
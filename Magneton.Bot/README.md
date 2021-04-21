# Magneton
Magneton is a discord bot made with C# using DSharpPlus discord library.
It was design to help improve the draft experience, by taking care of
the stressful part about running a draft.

## Developer Notes
This section is where I talk about my code.

The way I program is to keep stuff organized, and small as possible. In the `Core/Commands/DraftCommands.cs`,
you will see that I am calling on a static class in the `Handlers/Draft/DraftCommandHandler.cs`. 
You may think this is unefficient, however that is not the case in my eyes. You see by having all of the code
for the commands in the same file, will make the file seem clutter. So I decide to have that file have all of
the declarations, and another file to handle all of the command's internal code.


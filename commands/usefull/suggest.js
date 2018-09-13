const { Command } = require("discord.js-commando");

module.exports = class SuggestCommand extends Command {
	constructor(client) {
		super(client, {
			name: "suggest",
			memberName: "suggest",
			group: "usefull",
			description: "write a suggestion to me",
			throttling: {
				usages: 2, // in the time frame
				duration: 60 // in seconds
			},
			aliases: ["report", "bug", "issue"],
			details: "Sends the message written after the command to me",
		});
	}

	async run(msg) {
		const suggestCh = msg.client.channels.get("485069817427263488");
		try {
			if (msg.guild && msg.guild.members.some(e => !msg.client.owners.includes(e))) {
				await suggestCh.send(`https://discordapp.com/channels/${msg.guild.id}/${msg.channel.id}/${msg.id}
				${msg.command}: ${msg.argString.trim()}`);

			} else {
				await suggestCh.send(`${msg.guild ? `Guild:${msg.guild.name}(${msg.guild.id}) Channel:<#${msg.channel.id}>` : msg.channel.type} by <@${msg.author.id}>:
				${msg.command}: ${msg.argString.trim()}`);
			}

			return msg.channel.send("message was sent uwu");
		} catch (error) {
			console.error(error);
			return msg.reply("Sowwy, something went wwong ówò");
		}
	}
};
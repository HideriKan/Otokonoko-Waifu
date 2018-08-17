const { Command } = require("discord.js-commando");

module.exports = class SuggestCommand extends Command {
	constructor(client) {
		super(client, {
			name: "suggest",
			memberName: "suggest",
			group: "usefull",
			description: "write a suggestion to me",
			throttling: {
				usages: 1, // in the time frame
				duration: 5 // in seconds
			},
			aliases: ["report"],
			details: "Sends the message written after the command to me",
		});
	}

	run(msg) {
		const suggestCh = msg.client.channels.get("469875124494139392");
		try {
			if (msg.guild && msg.guild.members.some(e => !msg.client.owners.includes(e))) {
				return suggestCh.send(`https://discordapp.com/channels/${msg.guild.id}/${msg.channel.id}/${msg.id}`);
			}
			return suggestCh.send(`${msg.content} in ${msg.guild ? `Guild:${msg.guild.id} Channel:<#${msg.channel.id}>` : msg.channel.type} by <@${msg.author.id}>`);
		} catch (error) {
			console.error(error);
			return msg.reply("Sowwy, something went wwong ówò");
		}
	}
};
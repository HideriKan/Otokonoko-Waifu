const { Command } = require("discord.js-commando");

module.exports = class SuggestCommand extends Command {
	constructor(client) {
		super(client, {
			name: "suggest",
			memberName: "suggest",
			group: "dev",
			description: "write a suggestion to me",
			throttling: {
				usages: 1, // in the time frame
				duration: 5 // in seconds
			},
			aliases: [],
			examples: ["suggest du stinkst"],
			//details: "yo",
		});
	}

	run(msg) {
		try {			
			msg.client.channels.get("469875124494139392").send(`${msg.content} in ${msg.guild ? `Guild:${msg.guild.id} Channel:<#${msg.channel.id}>` : msg.channel.type} by <@${msg.author.id}>`);
		} catch (error) {
			console.error(error);
			return msg.reply("Sowwy, something went wwong ómò");
		}
		return msg.channel.send("message was send uwu");
	}
};
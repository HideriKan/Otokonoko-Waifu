const { Command } = require("discord.js-commando");
const fs = require("fs");

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
			details: "yo",
		});
	}

	async run(msg) {
		try {
			fs.appendFileSync("./suggest", `${msg.content} in ${msg.guild ? msg.guild.id : msg.channel} by <@${msg.author.id}> at ${msg.createdAt}\n`);
		} catch (error) {
			console.error(error);
			return msg.reply("Sowwy, something went wwong ómò");
		}
		return await msg.channel.send("message was send uwu");
	}
};

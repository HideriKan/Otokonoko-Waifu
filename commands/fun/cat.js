const { RichEmbed } = require("discord.js");
const { Command } = require("discord.js-commando");
const snekfech = require("snekfetch");
const api = "https://aws.random.cat/meow";

module.exports = class CatCommand extends Command {
	constructor(client) {
		super(client, {
			name: "cat",
			memberName: "cat",
			group: "fun",
			description: "Sends a random Cat",
			details: "Sends a random Cat image/gif", // long version of description
			throttling: {
				usages: 1, // in the time frame
				duration: 3 // in seconds
			},

		});
	}
	async run(msg) {
		const { body } = await snekfech.get(api);

		const embed = new RichEmbed()
			.setColor(msg.guild.me.displayColor)
			.setTitle("Moew :cat:")
			.setImage(body.file);

		msg.channel.send(embed)
			.catch(console.error);
	}
};
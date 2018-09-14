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
			examples:["cat"],
			throttling: {
				usages: 1,
				duration: 3
			},
		});
	}
	async run(msg) {
		try {
			const { body } = await snekfech.get(api);

			const embed = new RichEmbed()
				.setColor(msg.guild ? msg.guild.me.displayColor : "DEFAULT")
				.setTitle("Moew 🐱") // eslint-disable-line
				.setImage(body.file);

			msg.channel.send(embed)
				.catch(console.error);
		} catch (err) {
			if (err === "Error: 403 Forbidden") return msg.reply("403 Forbidden");
			console.error(err);
		}
	}
};
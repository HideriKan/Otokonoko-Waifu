const { Command } = require("discord.js-commando");
const { MessageEmbed } = require("discord.js");
const fetch = require("node-fetch");
const api = new URL("https://aws.random.cat/meow");

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
			const res = await fetch(api)
				.then(res => res.json())
				.catch(err => (console.log(err)));

			const embed = new MessageEmbed()
				.setColor(msg.guild ? msg.guild.me.displayColor : "DEFAULT")
				.setTitle("Moew 🐱") // eslint-disable-line
				.setImage(res.file);

			msg.channel.send(embed)
				.catch(console.error);
		} catch (err) {
			if (err === "Error: 403 Forbidden") return msg.reply("403 Forbidden");
			console.error(err);
		}
	}
};
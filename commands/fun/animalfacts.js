const { Command } = require("discord.js-commando");
const { MessageEmbed } = require("discord.js");
const fetch = require("node-fetch");
const api = new URL("https://cat-fact.herokuapp.com/facts/random");

module.exports = class AnimalFactsCommand extends Command {
	constructor(client) {
		super(client, {
			name: "animalfacts",
			memberName: "animalfacts",
			group: "fun",
			description: "Sends a random Animal Fact!",
			aliases:["afacts"],
			examples:["animalfacts"],
			throttling: {
				usages: 1,
				duration: 3
			},
		});
	}
	async run(msg) {
		const res = await fetch(api)
			.then(res => res.json())
			.catch(err => (console.log(err)));

		const embed = new MessageEmbed()
			.setColor(msg.guild ? msg.guild.me.displayColor : "DEFAULT")
			.setTitle(`${res.type} fact!`.capitalize())
			.setDescription(res.text);

		msg.channel.send(embed);
	}
};
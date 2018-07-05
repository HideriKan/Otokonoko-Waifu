const { Command } = require("discord.js-commando");
const { RichEmbed } = require("discord.js");
const snekfech = require("snekfetch");
const api = "https://cat-fact.herokuapp.com/";

module.exports = class AnimalFactsCommand extends Command {
	constructor(client) {
		super(client, {
			name: "animalfacts",
			memberName: "animalfacts",
			group: "fun",
			description: "Sends a random Animal Fact!",
			throttling: {
				usages: 1, // in the time frame
				duration: 3 // in seconds
			},
		});
	}
	async run(msg) {
		const {body} = await snekfech.get(`${api}facts/random`);
		const embed = new RichEmbed()
			.setTitle(`${body.type} fact!`)
			.setDescription(body.text)
			.setFooter(body.updatedAt);
		return msg.channel.send(embed);
	}
};
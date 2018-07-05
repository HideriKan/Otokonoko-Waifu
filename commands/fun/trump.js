const Discord = require("discord.js");
const snekfech = require("snekfetch");
const api = "https://api.whatdoestrumpthink.com/api/";

async function execute(message, args) {
	const embed = new Discord.RichEmbed()
		.setColor(message.guild.me.displayColor);

	if (!args.length) {
		const {body} = await snekfech.get(`${api}v1/quotes/random`);
		embed.setTitle("Trump said")
			.setDescription(body.message);

		return message.channel.send(embed).catch(console.error);
	}

	if (!message.mentions.users.size) {
		const {body} = await snekfech.get(`${api}v1/quotes/personalized?q=${args[0]}`);
		embed.setTitle("Trump maybe said")
			.setDescription(body.message);
		return message.channel.send(embed).catch(console.error);
	}

	const usersNickname = message.mentions.members.map(user => user.nickname);
	const {body} = await snekfech.get(`${api}v1/quotes/personalized?q=${usersNickname}`);
	embed.setTitle("Trump maybe said")
		.setDescription(body.message);

	return message.channel.send(embed).catch(console.error);
}

module.exports = {
	name: "trump",
	aliases: [],
	description: "returns a random trump quote",
	usage: "", // []required <>optional
	cooldown: 2,
	execute: execute
};
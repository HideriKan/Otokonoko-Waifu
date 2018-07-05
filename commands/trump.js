const Discord = require("discord.js");
const snekfech = require("snekfetch");
const api = "https://api.whatdoestrumpthink.com/api/";

async function execute(message, args) {
	const embed = new Discord.RichEmbed()
		.setColor(message.guild.me.displayColor);

	if (!args.length) {
		const {body} = await snekfech.get(`${api}v1/quotes/random`);
<<<<<<< HEAD
		
		return message.channel.send(`**Trump said:**\n${body.message}`).catch(console.error);
=======
		embed.setTitle("Trump said")
			.setDescription(body.message);

		return message.channel.send(embed).catch(console.error);
>>>>>>> d9d1cc38e09f29d2de5b6d5b8c260a2f0a0d065a
	}

	if (!message.mentions.users.size) {
		const {body} = await snekfech.get(`${api}v1/quotes/personalized?q=${args[0]}`);
<<<<<<< HEAD
		
		return message.channel.send(`**Trump maybe said:**\n${body.message}`).catch(console.error);
=======
		embed.setTitle("Trump maybe said")
			.setDescription(body.message);
		return message.channel.send(embed).catch(console.error);
>>>>>>> d9d1cc38e09f29d2de5b6d5b8c260a2f0a0d065a
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
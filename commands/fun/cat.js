const Discord = require("discord.js");
const snekfech = require("snekfetch");

async function execute(message) {
	const {body} = await snekfech.get("https://aws.random.cat/meow");

	const embed = new Discord.RichEmbed()
		.setColor(message.guild.me.displayColor)
		.setTitle("Moew :cat:")
		.setImage(body.file);

	message.channel.send(embed)
		.catch(console.error);
}

module.exports = {
	name: "cat",
	aliases: [],
	description: "",
	usage: "", // []required <>optional
	cooldown: 3,
	execute: execute,
};
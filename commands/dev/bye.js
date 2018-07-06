const { Command } = require("discord.js-commando");
const { RichEmbed } = require("discord.js");
module.exports = class ByeCommand extends Command {
	constructor(client) {
		super(client, {
			name: "bye",
			memberName: "bye",
			group: "dev",
			description: "Disconnects the bot",
			aliases: ["exit"],
			examples: ["bye"],
			ownerOnly: true,
			args: [{
				key: "text",
				prompt: "Please respond with `Confirm` to Disconnects the bot",
				type: "string",
				wait: 30,
			}]

		});
	}
	run(msg,{ text }) {
		const embed = new RichEmbed()
			.setColor(msg.guild ? msg.guild.me.displayColor : "DEFAULT")
			.setTitle("Exit");
		if (text !== "Confirm") return msg.channel.send(embed.setDescription("Arborting"));
		msg.channel.send(embed.setDescription("Good bye. :wave:"))
			.then(() => process.exit(0));
	}
};
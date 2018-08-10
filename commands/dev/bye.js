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
		});
	}
	run(msg, agrs) {
		const embed = new RichEmbed()
			.setColor(msg.guild ? msg.guild.me.displayColor : "DEFAULT")
			.setDescription("Good bye. \:wave:")
			.setTitle("Exit");
		msg.channel.send(embed) // eslint-disable-line
			.then(() => process.exit(0));
	}
};

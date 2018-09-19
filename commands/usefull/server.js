const { Command } = require("discord.js-commando");
const { RichEmbed } = require("discord.js");

module.exports = class ServerCommand extends Command {
	constructor(client) {
		super(client, {
			name: "server",
			group: "usefull",
			memberName: "server",
			description: "Display info about this server.",
			examples:["server"],
			guildOnly: true,
			cooldown: 2,
		});
	}

	run(msg) {
		const embed = new RichEmbed()
			.setColor(msg.guild.me.displayColor)
			.setTitle(msg.guild.name)
			.setDescription(msg.guild.memberCount);

		msg.channel.send(embed);
	}
};
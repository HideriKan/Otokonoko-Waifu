const {Command} = require("discord.js-commando");


module.exports = class ServerCommand extends Command {
	constructor(client) {
		super(client, {
			name: "server",
			group: "usefull",
			memberName: "server",
			description: "Display info about this server.",
			examples:["server"],
			aliases: ["s"],
			guildOnly: true,
			cooldown: 2,
		}, );
	}
	run(msg) {
		msg.channel.send(`**Server name**: ${msg.guild.name}\n**Total members**: ${msg.guild.memberCount}`);
	}
};
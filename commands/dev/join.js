//Base
const { Command } = require("discord.js-commando");

module.exports = class xCommand extends Command {
	constructor(client) {
		super(client, {
			name: "join",
			memberName: "join",
			group: "dev",
			description: "joins a channel",
			throttling: {
				usages: 1, // in the time frame
				duration: 5 // in seconds
			},
			aliases: ["j"],
			examples: ["join", "j"],
			details: "Attempts to join this voice channel",
		});
	}

	run(msg) {
		const vc = msg.guild.channels.find("id","430767868125118468");
		console.log();
		vc.join();
	}
};
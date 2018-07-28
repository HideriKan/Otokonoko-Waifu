//Base
const { Command } = require("discord.js-commando");

module.exports = class xCommand extends Command {
	constructor(client) {
		super(client, {
			name: "join",
			memberName: "j",
			group: "dev",
			description: "Join the Channel",
			throttling: {
				usages: 1, // in the time frame
				duration: 10 // in seconds
			},
			aliases: ["j"],
			examples: [],
		});
	}
	run(msg) {
		msg.member.voiceChannel.join();
	}
};

//Base
const { Command } = require("discord.js-commando");

module.exports = class JoinCommand extends Command {
	constructor(client) {
		super(client, {
			name: "play",
			memberName: "p",
			group: "dev",
			description: "Plays something",
			throttling: {
				usages: 1, // in the time frame
				duration: 10 // in seconds
			},
			aliases: ["j"],
			examples: [],
			details: "Plays something in the Channel you are in"
		});
	}
	async run(msg) {
		msg.member.voiceChannel.join()
			.then(connection => {
				connection.playFile("./src/combobreak.mp3");
			});
	}
};

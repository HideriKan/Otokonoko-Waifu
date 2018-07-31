//Base
const { Command } = require("discord.js-commando");

module.exports = class xCommand extends Command {
	constructor(client) {
		super(client, {
			name: "join",
<<<<<<< HEAD
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
=======
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
>>>>>>> ae7dea75ee52276d8a79e307adb735319c10d8b9

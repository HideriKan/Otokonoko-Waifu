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
				usages: 1,
				duration: 10
			},
			aliases: ["j"],
			examples: [],
			details: "Plays something in the Channel you are in",
			guildOnly: true
		});
	}
	async run(msg) {
		if (msg.member.voiceChannel) {
			if (msg.guild.voiceConnections.find("id", msg.member.voiceChannel.id)) {

				const dispatcher = msg.guild.voiceConnection.playFile("./src/moetest.mp3");

				dispatcher.on("end", reason => {
					console.log(reason);
					msg.channel.send("the song has ended");
				});
			}
			else {
				const connection = await msg.member.voiceChannel.join();
				const dispatcher = connection.playFile("./src/moetest.mp3");

				dispatcher.on("end", reason => {
					console.log(reason);
					msg.channel.send("the song has ended");
				});
			}
		} else {
			msg.reply("You need to join a voice channel first!");
		}

	}
};

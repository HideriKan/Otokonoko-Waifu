//Base
const { Command } = require("discord.js-commando");

module.exports = class HeartCommand extends Command {
	constructor(client) {
		super(client, {
			name: "heart",
			memberName: "h",
			group: "dev",
			description: "",
			throttling: {
				usages: 1, // in the time frame
				duration: 3 // in seconds
			},
			aliases: ["h"],
			args: [{
				key: "id",
				prompt: "Give me the ID of the Message you want me to remove",
				type: "string",
			}]
		});
	}
	async run(msg, { id }) {
		msg.delete();
		const m = await msg.channel.fetchMessage(id);
		m.react("💖");
	}
};
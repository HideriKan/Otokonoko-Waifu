//Base
const { Command } = require("discord.js-commando");

module.exports = class HeartCommand extends Command {
	constructor(client) {
		super(client, {
			name: "heart",
			memberName: "h",
			group: "dev",
			description: "",
			aliases: ["h"],
			ownerOnly: true,
			throttling: {
				usages: 1,
				duration: 3
			},
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
		m.reactions.every(e => m.react(e.emoji));
	}
};
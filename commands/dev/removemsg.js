const { Command } = require("discord.js-commando");

module.exports = class RemovemsgCommand extends Command {
	constructor(client) {
		super(client, {
			name: "removemsg",
			memberName: "removemsg",
			group: "dev",
			aliases: ["rmsg"],
			description: "Deletes a message",
			examples: ["removemsg 464428306251382796"], // []requireD <>optional
			throttling: {
				usages: 1, // in the time frame
				duration: 3 // in seconds
			},
			details: "This command deltes the message with the remove command and the message of the ID. The command needs to be in the same Channel as the Message requested to remove",
			ownerOnly: true,
			argsCount: 1,
			args: [{
				key: "id",
				prompt: "Give me the ID of the Message you want me to remove",
				type: "string",
			}]
		});
	}

	async run(msg, { id }) {
		if (!msg.deletable) return msg.reply("I don't have the permission to delete that message"); //still remove own message ?? what
		msg.delete();
		const m = await msg.channel.fetchMessage(id);
		console.log(`deleted "${m.content}"`);
		m.delete();
	}
};
const { Command } = require("discord.js-commando");

module.exports = class RemovemsgCommand extends Command {
	constructor(client) {
		super(client, {
			name: "removemsg",
			memberName: "removemsg",
			group: "usefull",
			aliases: ["rmsg"],
			description: "Deletes a message",
			examples: ["removemsg 464428306251382796"], // []requireD <>optional
			throttling: {
				usages: 1, // in the time frame
				duration: 3 // in seconds
			},
			details: "This command deltes the message from the bot, the request and the message of the ID. The command needs to be in the same Channel as the Message requested to remove", // long version of description
			ownerOnly: true,

			argsCount: 1, // max numbers
			argsSingleQuotes: true,
			args: [{
				key: "id",
				prompt: "Give me the ID of the Message you want me to remove",
				type: "string", // https://discord.js.org/#/docs/commando/master/class/CommandRegistry?scrollTo=registerDefaultTypes
			}]
		});
	}

	async run(msg, { id }) {
		if (!msg.deletable) return msg.reply("I don't have the permission to delete that message");
		msg.delete();
		const m = await msg.channel.fetchMessage(id);
		console.log(`deleted "${m.content}"`);
		m.delete();
	}
};
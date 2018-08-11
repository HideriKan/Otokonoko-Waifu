//Base
const { Command } = require("discord.js-commando");

module.exports = class TestMsgCommand extends Command {
	constructor(client) {
		super(client, {
			name: "testmsg",
			memberName: "test",
			group: "dev",
			description:"no",
			aliases: ["test"],
			ownerOnly: true,
		});
	}
	run(msg) {
		console.log(msg);
	}
};
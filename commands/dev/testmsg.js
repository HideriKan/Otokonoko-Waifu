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
			args:[
				{
					key:"msgId",
					prompt:"gimmi msgid",
					type:"string"
				}
			]
		});
	}
	async run(msg, { msgId }) {
		const thismsg = await msg.channel.fetchMessage(msgId);
		console.log(thismsg);
	}
};
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
		msg.channel.fetchMessage("474881589659041792")
			.then(mssg =>{

				let married = mssg.content.match(/\*\*[^()]+\*\* and/gi); //msg.content
				let marriedUserName = married[0].substring(2, married[0].length - 6);


				console.log(marriedUserName);
			});
	}
};
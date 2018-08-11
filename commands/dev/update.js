//Base
const { Command } = require("discord.js-commando");
// const path = require("path");

//Embed
// const { RichEmbed } = require("discord.js");

module.exports = class UpdateCommand extends Command {
	constructor(client) {
		super(client, {
			name: "update",
			memberName: "update",
			group: "dev",
			description: "updates the bot",
			aliases: ["up"],
			details: "updates the bot with a file over git",
			ownerOnly: true,
		});
	}
	run(msg) {
		if (process.platform === "linux") { // execFile .sh
			const { exec } = require("child_process");
			const sh = exec(__dirname + `/../../src/scripts/${this.name}.sh`);

			sh.stdout.on("data", data => console.log(data.toString()));
			sh.stderr.on("data", data => console.log(data.toString()));
			sh.on("exit", code => {
				outcomeMsg(msg, code);
				sh.kill();
			});
			return;
		} else if (process.platform === "win32") { // windows only
			const { spawn } = require("child_process");
			const bat = spawn(__dirname + `/../../src/scripts/${this.name}.bat`);

			bat.stdout.on("data", data => console.log(data.toString()));
			bat.stderr.on("data", data => console.log(data.toString()));
			bat.on("exit", code => {
				outcomeMsg(msg, code);
				bat.kill();
			});
			return;
		}

	}
};

function outcomeMsg(msg, code) {
	if (!code) {
		return msg.channel.send(`Update succ *code: ${code}*`);
	}
	return msg.channel.send(`Update failed *code: ${code}*`);
}
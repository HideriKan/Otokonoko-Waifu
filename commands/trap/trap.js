const fs = require("fs");
const { workpath } = require("./../../config.json");
const { Command } = require("discord.js-commando");

function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

module.exports = class TrapCommand extends Command {
	constructor(client) {
		super(client, {
			name: "trap",
			memberName: "trap",
			group: "trap",
			aliases: ["t", "traps"],
			description: "Posts traps",
			examples: ["trap", "trap 5"],
			details: "Max. amount of number is `5`. Posts a Trap out of my local Folder. This command was created with the intetion for my daily Trap posting",
			throttling: {
				usages: 2, // in the time frame
				duration: 10 // in seconds
			},
			guarded: true,
			guildOnly: true,
			argCount: 1, // max numbers
			args: [{
				key: "number",
				prompt: "How many trap(s) would you like me to post?",
				type: "integer",
				default: 1
			}]
		});
	}

	run(msg, { number }) {
		if (!fs.existsSync(workpath)) return msg.reply("Sowwy, something went wwong ówò");
		if (!fs.existsSync(workpath + "/../Posted/")) return msg.reply("Sowwy, something went wwong ówò");
		if (number > 5) {
			msg.channel.send("The maximum is 5 per command.\nYour request has been reduced to 5");
			number = 5;
		}

		let allPics = fs.readdirSync(workpath).filter(pics => pics.includes("."));
		let removed = [];

		for (let i = number; i > 0; i--) {
			if (allPics.length !== 0) { // make a oneline out of this shit
				const fileNr = getRandomInt(allPics.length);

				msg.channel.send({
					files: [{
						attachment: workpath + "/" + allPics[fileNr]
					}]
				})
					.then(removed.push(allPics[fileNr]))
					.then(allPics.splice(fileNr, 1))
					.catch((e) => console.error(e))
					.then(() => {
						fs.renameSync(workpath + "/" + removed[0], workpath + "/../Posted/" + removed[0]);
						console.log("moved " + removed[0]);
						removed.splice(0, 1);
					});

			} else {
				// msg.reply("ayy your the first to get this message. dont know if this will work but yea, <@146493901803487233>"); //TODO:test this before
				// const allPosetedPics = fs.readdirSync(workpath + "/../Posted/").filter(pics => pics.includes("."));
				// allPosetedPics.forEach(pic => {
				// 	fs.renameSync(workpath + "/../Posted/" + pic, workpath + "/" + pic);
				// });
				msg.channel.send("Dir Emtpy!, <@146493901803487233>");
			}
		}
	}
};
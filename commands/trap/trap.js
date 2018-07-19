const fs = require("fs");
const { workpath , lewdworkpath } = require("./../../config.json");
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
			examples: ["trap", "trap 5", "trap 1 -lewd"],
			details: "Max. amount of number is `5`. With an `-lewd`, `-l` or `-nsfw` after the number it will post NSFW picture. Posts a picture out of my local Folder. This command was created with the intetion for my daily Trap posting.",
			throttling: {
				usages: 2, // in the time frame
				duration: 10 // in seconds
			},
			guarded: true,
			guildOnly: true,
			argCount: 2, // max numbers
			args: [
				{
					key: "number",
					prompt: "How many trap(s) would you like me to post?",
					type: "integer",
					default: 1
				},
				{
					key: "lewd",
					prompt: "this should be -lewd to post lewds",
					type: "string",
					default: "",
					validate: lewd => {
						if (lewd == "-lewd" ||
							lewd == "-l") return true;
						return false;
					},
				}
			]
		});
	}

	run(msg, { number, lewd }) {
		let path;
		switch (lewd) { // check if a lewd is passed
		case "-l":
		case "-lewd":
		case "-nsfw":
			if (!msg.channel.nsfw) return msg.channel.send("Nyo nsfw in sfw channyews (・`m´・)");
			path = lewdworkpath;
			break;
		default:
			path = workpath;
		}
		
		if (!fs.existsSync(path)) return msg.reply("Sowwy, something went wwong ówò");
		if (number > 5) {
			msg.channel.send("The maximum is 5 per command.\nYour request has been reduced to 5");
			number = 5;
		}

		// check in db
		let allPics = fs.readdirSync(path).filter(pics => pics.includes("."));
		let removed = [];

		for (let i = number; i > 0; i--) {
			if (!allPics) {
				//unlock all pics in db
				return msg.channel.send("Dir Emtpy!, <@146493901803487233>");
			}
			const fileNr = getRandomInt(allPics.length);

			msg.channel.send({
				files: [{
					attachment: path + "/" + allPics[fileNr]
				}]
			})
				.then(removed.push(allPics[fileNr]))
				.then(allPics.splice(fileNr, 1)) // move to db 
				.catch((e) => console.error(e))
				.then(() => {
					fs.renameSync(path + "/" + removed[0], path + "/../Posted/" + removed[0]);
					console.log("moved " + removed[0]);
					removed.splice(0, 1);
				});		
		}	
	}
};
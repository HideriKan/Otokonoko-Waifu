const fs = require("fs");
const {lewdworkpath} = require("./../../config.json");
const {Command} = require("discord.js-commando");

function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

module.exports = class LewdtrapCommand extends Command {
	constructor(client) {
		super(client, {
			name: "lewdtrap",
			memberName: "lewdtrap",
			group: "trap",
			aliases: ["lt", "lewdtraps", "ltraps", "ltrap"],
			description: "Posts lewd traps",
			examples: ["lewdtrap 5", "lt 10"],
			nsfw: true,
			throttling: {
				usages: 2, // in the time frame
				duration: 5 // in seconds
			},
			guarded: true,
			guildOnly: true,
			argCount: 1, // max numbers
			args: [{
				key: "number",
				prompt: "How many lewd trap(s) would you like me to post?",
				type: "integer",
				default: 1
			}]
		});
	}

	run(msg, { number }) {
		if (!fs.existsSync(lewdworkpath)) return msg.reply("Sowwy, Something went wwong ówò");
		if (number > 10) {
			msg.channel.send("The maximum is 10 per command.\nYour request has been reduced to 10");
			number = 10;
		}

		let allPics = fs.readdirSync(lewdworkpath).filter(pics => pics.includes("."));
		let removed = [];

		for (let i = number; i > 0; i--) {
			if (allPics.length !== 0) {
				const fileNr = getRandomInt(allPics.length);

				msg.channel.send({
					files: [{
						attachment: lewdworkpath + "/" + allPics[fileNr]
					}]
				})
					.then(() => {
						fs.renameSync(lewdworkpath + "/" + removed[0], lewdworkpath + "/../Posted/" + removed[0]);
						console.log("moved " + removed[0]);
						removed.splice(0, 1);
					})
					.then(removed.push(allPics[fileNr]))
					.then(allPics.splice(fileNr, 1))
					.catch((e) => console.error(e));

			} else {
				msg.reply("ayy your the first to get this message. dont know if this will work but yea, <@146493901803487233>"); //TODO:test this before
				// const allPosetedPics = fs.readdirSync(lewdworkpath + "/../Posted/").filter(pics => pics.includes("."));
				// allPosetedPics.forEach(pic => {
				// 	fs.renameSync(lewdworkpath + "/../Posted/" + pic, lewdworkpath + "/" + pic);
				// });
			}

		}
	}
};
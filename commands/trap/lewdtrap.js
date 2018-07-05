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
			description: "posts lewd traps",
			examples: ["lewdtrap 5", "lt 10"],
			nsfw: true,
			throttling: {
				usages: 2, // in the time frame
				duration: 5 // in seconds
			},
			guarded: true,
			guildOnly: true,
			numCount: 1, // max numbers
			args: [{
				key: "num",
				prompt: "How many trap would you like me to post?",
				type: "integer",
				default: 1
			}]
		});
	}

	run(msg, num) {
		if (num > 10) {
			msg.channel.send("The maximum is 10 per command.\nYour request has been reduced to 10");
			num = 10;
		}

		let allPics = fs.readdirSync(lewdworkpath).filter(pics => pics.includes("."));
		let removed = [];

		for (let i = num; i > 0; i--) {
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
				msg.channel.send("Dir Emtpy!"); //TODO:if emtpy copy to all "TOPOST"
			}

		}
	}
};
const fs = require("fs");
const { workpath } = require("./../../config.json");
const { Command } = require("discord.js-commando");
// const { Command } = require("discord.js-commando");

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
			description: "posts traps",
			details: "This command was created with the intetion for my daily Trap posting", // long version of description
			examples: ["trap 5", "t 5"],
			throttling: {
				usages: 2, // in the time frame
				duration: 43200 // in seconds
			},
			guarded: true,
			guildOnly: true,
			numCount: 1, // max numbers
			args: [{
				key: "num",
				prompt: "How many trap would you like me to post?",
				type: "integer", // https://discord.js.org/#/docs/commando/master/class/CommandRegistry?scrollTo=registerDefaultTypes
				validate: num => {
					if(num < 5) return true;
					num = 5;
					return "The maximum is 5 per command.\nYour request has been reduced to 5";
				},
				default: 1
			}]

		});
	}

	run(msg, { num }) { 
		let allPics = fs.readdirSync(workpath).filter(pics => pics.includes("."));
		let removed = [];
		for (let i = num; i > 0; i--) {
			if (allPics.length !== 0) {
				const fileNr = getRandomInt(allPics.length);
				// const embed = new RichEmbed()
				// 	.setColor(msg.guild.me.displayColor)
				// 	.attachFile({"attachment": workpath + "/" + allPics[fileNr]});

				// msg.channel.send(embed) 
				msg.channel.send({
					files: [{
						attachment: workpath + "/" + allPics[fileNr]
					}]
				})
					.then(() => {
						fs.renameSync(workpath + "/" + removed[0], workpath + "/../Posted/" + removed[0]);
						console.log("moved " + removed[0]);
						removed.splice(0, 1);
					})
					.then(removed.push(allPics[fileNr]))
					.then(allPics.splice(fileNr, 1))
					.catch((e) => console.error(e));

			} else {
				msg.channel.send("Dir Emtpy!"); //TODO: add crying emote
			}
		}
	}
};
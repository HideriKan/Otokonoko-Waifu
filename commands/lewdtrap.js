const fs = require("fs");
const {lewdworkpath} = require("./../config.json");

function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

module.exports = {
	name: "lewdtrap",
	aliases: ["lt", "lewdtraps", "ltraps", "ltrap"],
	description: "posts lewd traps",
	usage: "<nubmer of files(1-10)>",
	cooldown: 5,
	execute(message, args) {

		if (!message.channel.nsfw) return message.reply("this is not a NSFW channel, Baka!");
		if (args.length === 0) args.push(1);
		if (args.length > 10) message.channel.send("The maximum is 10 per command.\nYour request has been reduced to 10").then(() => args.push(0, 1, 10));

		let allPics = fs.readdirSync(lewdworkpath).filter(pics => pics.includes("."));
		let removed = [];

		for (let i = args[0]; i > 0; i--) {
			if (allPics.length !== 0) {
				const fileNr = getRandomInt(allPics.length);

				message.channel.send({
					files: [{
						attachment: lewdworkpath + "/" + allPics[fileNr]
					}]
				})
					.then(() => {
						if (!(message.guild.id === 430767868125118464)) {
							fs.renameSync(lewdworkpath + "/" + removed[0], lewdworkpath + "/../Posted/" + removed[0]);
							console.log("moved " + removed[0]);
							removed.splice(0, 1);
						}
					})
					.then(removed.push(allPics[fileNr]))
					.then(allPics.splice(fileNr, 1))
					.catch((e) => console.error(e));

			} else {
				message.channel.send("Dir Emtpy!"); //TODO:if emtpy copy to all "TOPOST"
			}
		}
	}
};
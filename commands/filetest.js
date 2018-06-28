const fs = require("fs");
const config = require("./../config.json");

function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

module.exports = {
	name: "filetest",
	aliases: ["f", "t"],
	descriptrion: "posts file(s)",
	usage: "<nubmer of files>",
	cooldown: 1,
	execute(message, args) { // TODO: fix
		if (args.length === 0) args.push(1);
		if (args.length > 5) args.push(0, 1, 5);
		let allPics = fs.readdirSync(config.workpath).filter(pics => pics.includes("."));
		for (let i = args[0]; i > 0; i--) {
			console.error(i);
			if (allPics.length !== 0) {
				const fileNr = allPics[getRandomInt(allPics.length)];

				message.channel.send({
					files: [{
						attachment: config.workpath + "/" + allPics[fileNr]
					}]
				})
					.then(() => {
						fs.renameSync(config.workpath + "/" + allPics[fileNr], config.workpath + "/../" + allPics[fileNr]);
						console.log("moved " + allPics[fileNr]);
					})
					.then(allPics = allPics.slice(fileNr))
					.catch((e) => console.error(e));

			} else {
				message.channel.send("Dir Emtpy!"); //TODO: add crying emote
			}
		}
	}
};
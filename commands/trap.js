const fs = require("fs");
const {
	workpath
} = require("./../config.json"); // change

function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

module.exports = {
	name: "trap",
	aliases: ["t", "traps"],
	descriptrion: "posts traps / the cooldown is 12hours",
	usage: "<nubmer of files>",
	cooldown: 43200, //TODO: add server cd 43200
	execute(message, args) { // TODO: fix 
		if (args.length === 0) args.push(1);
		if (args.length > 5) args.push(0, 1, 5);
		let allPics = fs.readdirSync(workpath).filter(pics => pics.includes("."));
		let removed = [];
		for (let i = args[0]; i > 0; i--) {
			if (allPics.length !== 0) {
				const fileNr = getRandomInt(allPics.length);

				message.channel.send({
					files: [{
						attachment: workpath + "/" + allPics[fileNr]
					}]
				})
					.then(() => { // TODO: splice moved removed
						if (!(message.guild.id === 430767868125118464)) {
							fs.renameSync(workpath + "/" + removed[0], workpath + "/../Posted/" + removed[0]);
							console.log("moved " + removed[0]);
							removed.splice(0, 1);
						}
					})
					.then(removed.push(allPics[fileNr]))
					.then(allPics.splice(fileNr, 1))
					.catch((e) => console.error(e));

			} else {
				message.channel.send("Dir Emtpy!"); //TODO: add crying emote
			}
		}
	}
};
module.exports = {
	name: "bye",
	aliases: ["exit", "die"],
	description: "Disconnects the bot",
	usage: "",
	cooldown: 1,
	args: false,
	execute(message) {
		message.channel.send("Good bye.")
			.then(() => process.exit(0));
	},
};
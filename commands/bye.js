module.exports = {
	name: "bye",
	aliases: ["exit", "die"],
	description: "Disconnects the bot",
	usage: "",
	beta: true,
	execute(message) {
		message.channel.send("Good bye. :wave:")
			.then(() => process.exit(0));
	},
};
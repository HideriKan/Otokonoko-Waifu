async function execute(message, args) {
	if (!message.deletable) return message.reply("I don't have the permission to delete that message");
	message.delete();
	message.channel.fetchMessage(args[0])
		.then((m)=> {
			console.log(`deleted ${m.content}`);
			m.delete();
		})
		.catch((e)=>console.error(e));
}

module.exports = {
	name: "removemsg",
	aliases: ["rmsg"],
	description: "deletes the message of the command and the given message",
	usage: "[id of message(s)]", // []required <>optional
	cooldown: 5,
	beta: true, // for beta server only
	args: true, // if args needed
	execute: execute
};
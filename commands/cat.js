const snekfech = require("snekfetch");

async function execute(message) {
	const {body} = await snekfech.get("https://aws.random.cat/meow");

	message.channel.send(body.file)
		.catch(console.error);
}

module.exports = {
	name: "cat",
	aliases: [],
	description: "",
	usage: "", // []required <>optional
	cooldown: 3,
	execute: execute,
};
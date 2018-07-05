const snekfech = require("snekfetch");
const api = "https://cat-fact.herokuapp.com/";

async function execute(message) {
	const {body} = await snekfech.get(`${api}facts/random`);

	return message.channel.send(body.text)
		.catch(console.error);
}

module.exports = {
	name: "catfacts",
	description: "Give you cat facts",
	cooldown: 2,
	execute: execute
};
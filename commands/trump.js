const snekfech = require("snekfetch");
const api = "https://api.whatdoestrumpthink.com/api/";

async function execute(message, args) {

	if (!args.length) {
		const {body} = await snekfech.get(`${api}v1/quotes/random`);
		return message.channel.send(`**Trump said:**\n${body.message}`).catch(console.error);
	}

	if (!message.mentions.users.size) {
		const {body} = await snekfech.get(`${api}v1/quotes/personalized?q=${args[0]}`);
		return message.channel.send(`**Trump maybe said:**\n${body.message}`).catch(console.error);
	}

	const usersNickname = message.mentions.members.map(user => user.nickname);
	const {body} = await snekfech.get(`${api}v1/quotes/personalized?q=${usersNickname}`);

	return message.channel.send(`**Trump maybe said:**\n${body.message}`).catch(console.error);
}

module.exports = {
	name: "trump",
	aliases: [],
	description: "returns a random trump quote",
	usage: "", // []required <>optional
	cooldown: 2,
	execute: execute
};
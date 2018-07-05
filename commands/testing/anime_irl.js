const Discord = require("discord.js");
const snekfech = require("snekfetch");
const api = "https://www.reddit.com/r/anime_irl/new.json";

async function execute(message) {

}

module.exports = {
	name: "anime_irl",
	aliases: ["airl"],
	description: "",
	usage: "", // []required <>optional
	cooldown: 2,
	guildOnly: true, // for server commands only 
	beta: true, // for beta server only
	args: true, // if args needed
	execute: execute
};
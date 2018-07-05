const Discord = require("discord.js");
const snekfech = require("snekfetch");
const api = "https://api.urbandictionary.com/v0/define";
const trim = (str, max) => (str.length > max) ? `${str.slice(0, max-3)}...` : str;

async function execute(message, args) {
	const {body} = await snekfech.get(api).query({
		term: args.join(" ")
	});

	if (body.result_type === "no_results") return message.channel.send(`No results found for **${args.join(" ")}**`);

	const [answer] = body.list;
	const embed = new Discord.RichEmbed()
		.setColor("#EFFF00")
		.setTitle(answer.word)
		.setURL(answer.permalink)
		.addField("Definition", trim(answer.definition, 1024))
		.addField("Example", trim(answer.example, 1024))
		.addField("Rating", `${answer.thumbs_up} thumbs up.\n${answer.thumbs_down} thumbs down.`)
		.setFooter(`Tags: ${body.tags.join(", ")}`);

	message.channel.send(embed);

}

module.exports = {
	name: "urban",
	description: "searches the Urban Dictionary for you input",
	usage: "[text]", // []required <>optional
	cooldown: 2,
	args: true, // if args needed
	execute: execute
};
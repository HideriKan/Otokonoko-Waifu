const { Command } = require("discord.js-commando");
const { RichEmbed } = require("discord.js");
const snekfech = require("snekfetch");
const api = "https://www.reddit.com";

module.exports = class RedditCommand extends Command {
	constructor(client) {
		super(client, {
			name: "reddit",
			memberName: "reddit",
			group: "fun",
			description: "Posts Images from a subreddit",
			details: "Choose a subreddit to post **only** images from. Can be sorted by `top`, `new`, `controversial` or `rising`.",
			throttling: {
				usages: 1, // in the time frame
				duration: 3 // in seconds
			},
			examples: ["reddit anime_irl", "reddit animemes top"], // []required <>optional
			argsCount: 2, // max numbers
			args: [{
				key: "subreddit",
				prompt: "What subreddit would you like me to post from?",
				type: "string",
			},
			{
				key: "sort",
				prompt: "Sort for `top`, `new`, `controversial`, `rising` or `no sort`",
				type: "string",
				validate: sort => {
					if (sort === "top" ||
						sort === "new" ||
						sort === "controversial" ||
						sort === "rising") return true;
				},
				default: ""
			}
			]

		});
	}
	async run(msg, {reddit,sort}) { //TODO: 404/403 error catch //TODO: include text posts
		const { body } = await snekfech.get(`${api}/r/${reddit}/${sort}.json?limit=0`);
		const about = await snekfech.get(`${api}/r/${reddit}/about.json`);
		for (let i = 0; i < body.data.children.length; i++) {
			const data = body.data.children[i].data;
			if (data.url.endsWith(".jpg") ||
				data.url.endsWith(".gif") ||
				data.url.endsWith(".png") ||
				data.over_18 == msg.channel.nsfw ||
				data.spoiler) {
				const redditIcon = about.body.data.icon_img;
				const embed = new RichEmbed()
					.setColor(msg.guild ? msg.guild.me.displayColor : "DEFAULT")
					.setAuthor(data.subreddit_name_prefixed, redditIcon)
					.setTitle(data.title)
					.setURL(api + data.permalink)
					.setImage(data.url)
					.setFooter(`Score ${data.score} by u /${data.author}`);
				msg.channel.send(embed);
				return;
			}
		}
		msg.channel.send("Sorry no Images to post found");
	}
};
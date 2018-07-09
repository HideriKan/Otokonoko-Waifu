const { Command } = require("discord.js-commando");
const { RichEmbed } = require("discord.js");
const snekfech = require("snekfetch");
const { imgurClientID } = require("./../../config.json"); 
const redditAPI = "https://www.reddit.com";
const imgurAPI = "https://api.imgur.com/3/image/";

module.exports = class RedditCommand extends Command {
	constructor(client) {
		super(client, {
			name: "reddit",
			memberName: "reddit",
			group: "fun",
			aliases:["r/"],
			description: "Posts Images from a subreddit",
			details: "Choose a subreddit to post **only** images from. Can be sorted by `top`, `new`, `controversial` or `rising`.",
			throttling: {
				usages: 1, // in the time frame
				duration: 3 // in seconds
			},
			examples: ["reddit anime_irl", "reddit animemes top"],
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
	async run(msg, { subreddit, sort }) { //TODO: include text posts, videos (.webm/gifcat)
		try {
			const { body } = await snekfech.get(`${redditAPI}/r/${subreddit}/${sort}.json`);
			const about = await snekfech.get(`${redditAPI}/r/${subreddit}/about.json`);

			for (let i = 0; i < body.data.children.length; i++) {
				let data = body.data.children[i].data;
				// data.url = "https://gfycat.com/KlutzySleepyFlatcoatretriever";

				if (data.url.includes("https://imgur.com/") ||
					data.url.includes(".jpg") ||
					data.url.includes(".gif") ||
					data.url.includes(".gifv") ||
					data.url.includes(".png") &&
					data.over_18 == msg.channel.nsfw &&
					!data.spoiler) 
				{

					const redditIcon = about.body.data.icon_img;
					const embed = new RichEmbed()
						.setColor(msg.guild ? msg.guild.me.displayColor : "DEFAULT")
						.setAuthor(data.subreddit_name_prefixed, redditIcon, redditAPI + "/" + data.subreddit_name_prefixed)
						.setTitle(data.title)
						.setURL(redditAPI + data.permalink)
						.setFooter(`Karma ${data.score} by u/${data.author}`);

					if (data.url.includes("https://imgur.com/")) {
						const imageHash = data.url.replace("https://imgur.com/", "");
						const imgur = await snekfech.get(imgurAPI+imageHash).set("Authorization", `Client-ID ${imgurClientID}`);
						embed.setImage(imgur.body.data.link);
					} else if (data.url.includes(".gifv")) { //only until discord supports gifv
						embed.setImage(data.url.replace(".gifv",".gif"));
					}
					else{
						embed.setImage(data.url);
					}
						
					return msg.channel.send(embed);
				}
			}
			msg.channel.send("Sorry no Images to post found");
		} catch (err) {
			if (err == "Error: 404 Not Found") return msg.reply("404. Subreddit now found please check the spelling");
			if (err == "Error: 403 Forbidden") return msg.reply("403 Forbidden. Dont know why :shrug:");
			console.error(err);
		}

	}
};
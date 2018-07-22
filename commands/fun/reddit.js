const { Command } = require("discord.js-commando");
const { RichEmbed } = require("discord.js");
const snekfech = require("snekfetch");
const { imgurClientID } = require("./../../config.json");
const path = require("path");
const sqlite = require("better-sqlite3");
const db = new sqlite(path.join(__dirname,"database.sqlite3"));

const redditAPI = "https://www.reddit.com";
const imgurAPI = "https://api.imgur.com/3/";
const gfycatAPI = "https://api.gfycat.com/v1/gfycats/";


// img endings that can be posted
function imgEnding(data) {
	if (data.url.includes(".jpg") ||
		data.url.includes(".gif") ||
		data.url.includes(".png") ||
		data.url.includes(".webp") ||
		data.url.includes(".jpeg")
	) return true;
	return false;
}

//link that this command supports
function includesknownLink(data) {
	if (data.url.includes("https://imgur.com/") ||
		data.url.includes("https://v.redd.it/") ||
		data.url.includes("https://gfycat.com/") ||
		data.url.includes("https://streamable.com/")
	) return true;
	return false;
}

function checkSuitability(data) {
	if (imgEnding(data) || includesknownLink(data)) return true;
	return false;
}

// if needed get the img from the api => var => var into embed
async function getEmbedData(data, redditIcon, msg) {
	let embedImg = data.url;
	let embedTitle = data.title;
	let embedDes;
	const embed = new RichEmbed()
		.setColor(msg.guild ? msg.guild.me.displayColor : "DEFAULT")
		.setAuthor(data.subreddit_name_prefixed, redditIcon ? redditIcon : "" , redditAPI + "/" + data.subreddit_name_prefixed)
		.setTitle(embedTitle)
		.setURL(redditAPI + data.permalink)
		.setFooter(`Karma ${data.score} by u/${data.author}`);

	if (imgEnding(data)) {
		if (embedImg.includes(".gifv")) { // untill discord supports gifv
			msg.channel.send(embedImg);
			return embed.setDescription(embedImg + "\nthis is a gifv and it isnt supported yet");
		}
		return embed.setImage(embedImg);
	} else if (includesknownLink(data)) {
		if (embedImg.includes("https://imgur.com/")) {
			if (embedImg.includes("https://imgur.com/a/")) {
				const hash = embedImg.replace("https://imgur.com/a/", "");
				const imgur = await snekfech.get(imgurAPI + "album/" + hash).set("Authorization", `Client-ID ${imgurClientID}`);

				embedImg = imgur.body.data.images[0].link;
				embedTitle =+ "[Imgur Album]";
			} else if (embedImg.includes("https://imgur.com/")) {
				const hash = embedImg.replace("https://imgur.com/", "");
				const imgur = await snekfech.get(imgurAPI + "image/" + hash).set("Authorization", `Client-ID ${imgurClientID}`);

				embedImg = imgur.body.data.link;
			}
		} else if (embedImg.includes("https://gfycat.com/")) {
			const hash = embedImg.replace("https://gfycat.com/", "");
			const gfycat = await snekfech.get(gfycatAPI + hash);
			
			embedDes = "*this is a low quality gif*\nGo to the Original:\n" + embedImg;
			embedImg = gfycat.body.gfyItem.max5mbGif;
		} else if (embedImg.includes("https://streamable.com/")) { // till discord supports to embed videos
			embedDes = "this is not yet supported by discord\n" + embedImg;
			msg.channel.send(embedImg);
			embedImg = undefined;
		} else if (embedImg.includes("https://v.redd.it/")) { // kinda works
			embedDes = "**__This is a reddit hosted video. Go to the video thru the title__**";
			embedImg = data.preview ? data.preview.images[0].source.url : "";
		}
		
		// this might not be the best
		if (embedDes) embed.setDescription(embedDes);
		return embed
			.setTitle(embedTitle)
			.setImage(embedImg);	
	}
	return embed
		.setDescription("this might not display properly")
		.setImage(embedImg);
	
}

module.exports = class RedditCommand extends Command {
	constructor(client) {
		super(client, {
			name: "reddit",
			memberName: "reddit",
			group: "fun",
			aliases: ["r", "r/", "/r", "/r/"],
			description: "Sends the first post from a subreddit",
			details: "Can be sorted by `hot`, `top`, `new`, `controversial` or `rising`. Can also send a specific post by giving the bot the post id instead of the  .Posts **only** images from the subreddit. This bot will not post NSFW in a SFW channel or a spoiler.",
			throttling: {
				usages: 1, // in the time frame
				duration: 3 // in seconds
			},
			examples: ["reddit anime_irl", "reddit animemes top", "reddit animemes 8zf79f"],
			argsCount: 2, // max args
			args: [
				{
					key: "subreddit",
					prompt: "What subreddit would you like me to post from?",
					type: "string",
					error: ""
				},
				{
					key: "text",
					prompt: "Either sort the subreddit for `hot`, top`, `new`, `controversial`, `rising`, `no sort` or post a comment",
					type: "string",
					default: ""
				}
			] // TODO: wished args are [post x times]

		});
	}

	
	async run(msg, { subreddit, text }) { //TODO: (DB) dont repost // arg loop/post x times // include videos (.webm till it supports it)
		try {		
			let isReddit;
			switch (text) { // check if a sort is passed
			case "":
			case "hot":
			case "top":
			case "new":
			case "rising":
			case "controversial":
				isReddit = true;
				break;
			default:
				isReddit = false;
			}

			if(isReddit) { // code for when a subreddit is passed
				// db.prepare("DROP TABLE IF EXISTS redditposted").run();
				db.prepare(`
				CREATE TABLE IF NOT EXISTS redditposted( 
					redditposted_id integer PRIMARY KEY AUTOINCREMENT, 
					subreddit_name text NOT NULL, 
					post_id text NULL,
					guild_id text,
					time_send datetime NOT NULL)
					`
				).run();
				db.prepare("DELETE FROM redditposted WHERE time_send < DATETIME('NOW', '-1 day')").run(); // make this work
				const dbcheck = db.prepare("SELECT * FROM redditposted WHERE post_id == (?)");
				const dbinsert = db.prepare("INSERT INTO redditposted VALUES (?, ?, ?, ?, datetime(?))");

				const { body } = await snekfech.get(`${redditAPI}/r/${subreddit}/${text}.json`);
				const about = await snekfech.get(`${redditAPI}/r/${subreddit}/about.json`);
				let time_posted = new Date(msg.createdTimestamp);
				
				for (let i = 0; i < body.data.children.length; i++) {
					const data = body.data.children[i].data;

					if (checkSuitability(data)) {
						if (!(!about.body.data.over18 || msg.channel.nsfw)) return msg.channel.send("You cant chose a NSFW subweddit in a SFW channyew òwó");
						if (!(!data.over_18 || msg.channel.nsfw) || data.spoiler) continue; //hope this works like I want it to be

						let row = dbcheck.get(data.id); // add guild id to select
						if(!row) { // 
							dbinsert.run(null, data.subreddit, data.id, msg.guild ? msg.guild.id : "", time_posted.toISOString());
						}else {
							continue;
						}

						return msg.channel.send(await getEmbedData(data, about.body.data.icon_img, msg));
					}
				}
				return msg.channel.send("Sowwy nyo Images found to post uwu");

			} else if(!isReddit) { // code for default which should be a subreddit and a comment
				const { body } = await snekfech.get(`${redditAPI}/r/${subreddit}/comments/${text}.json`);
				const about = await snekfech.get(`${redditAPI}/r/${subreddit}/about.json`);
				const data = body[0].data.children[0].data;

				if (checkSuitability(data))  {
					if (!(!about.body.data.over18 || msg.channel.nsfw)) return msg.channel.send("You cant chose a NSFW subweddit in a SFW channyew òwó");
					if (!(!data.over_18 || msg.channel.nsfw) || data.spoiler) return; //hope this works like I want it to be

					return msg.channel.send(await getEmbedData(data, about.body.data.icon_img, msg));
				}
			}
			return msg.reply("I dont know what you did but you broke something");

		} catch (err) {
			console.error(err);
			if (err == "Error: 404 Not Found") return msg.reply("404. Subreddit or Comment not found please check the spelling");
			if (err == "Error: 403 Forbidden") return msg.reply("403 Forbidden. Dont know why \:shrug:"); // eslint-disable-line
			return msg.reply("Something went wrong.");
		}
	}
};
const { Command } = require("discord.js-commando");
const { MessageEmbed } = require("discord.js");
const fetch = require("node-fetch");
const { imgurClientID } = require("./../../config.json");
const path = require("path");
const Sqlite = require("better-sqlite3");
const db = new Sqlite(path.join(__dirname,"/../../database.sqlite3"));

const redditAPI = new URL("https://www.reddit.com");
const imgurAPI = new URL("https://api.imgur.com/3/");
const gfycatAPI = new URL("https://api.gfycat.com/v1/gfycats/");

const trim = (str, max) => (str.length > max) ? `${str.slice(0, max-3)}...` : str; // will cut the string if it will go over the max

// db.prepare("DROP TABLE IF EXISTS redditposted").run();
db.prepare(`CREATE TABLE IF NOT EXISTS redditposted(
	redditposted_id integer PRIMARY KEY,
	subreddit_name text NOT NULL,
	post_id text NOT NULL,
	guild_or_user_id integer NOT NULL,
	time_send datetime NOT NULL)`
).run(); // redditposted_id is probally not needed
const dbcheck = db.prepare("SELECT * FROM redditposted WHERE post_id = (?) AND guild_or_user_id = (?)");
const dbinsert = db.prepare("INSERT INTO redditposted VALUES (?, ?, ?, ?, datetime(?))");

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

async function getEmbedData(data, redditIcon, msg) {
	let embedImg = data.url;
	let embedTitle = data.title;
	let embedDes;
	const embed = new MessageEmbed()
		.setColor("#b68a86")
		.setAuthor(data.subreddit_name_prefixed, redditIcon ? redditIcon : "" , redditAPI + "/" + data.subreddit_name_prefixed)
		.setTitle(trim(embedTitle, 256))
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
				const imgur = await fetch(imgurAPI + "album/" + hash, { headers: { "Authorization": `Client-ID ${imgurClientID}`}})
					.then(res => res.json())
					.catch(err => (console.log(err)));

				embedImg = imgur.data.images[0].link;
				embedTitle =+ "[Imgur Album]";
			} else if (embedImg.includes("https://imgur.com/")) {
				const hash = embedImg.replace("https://imgur.com/", "");
				const imgur = await fetch(imgurAPI + "image/" + hash, { headers: { "Authorization": `Client-ID ${imgurClientID}`}})
					.then(res => res.json())
					.catch(err => (console.log(err)));

				embedImg = imgur.data.link;
			}
		} else if (embedImg.includes("https://gfycat.com/")) {
			const hash = embedImg.replace("https://gfycat.com/", "");

			const gfycat = await fetch(gfycatAPI + hash)
				.then(res => res.json())
				.catch(err => (console.log(err)));

			embedDes = "**this is a low quality gif** Go to the Original:\n" + embedImg;
			embedImg = gfycat.gfyItem.max5mbGif;
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
				usages: 1,
				duration: 3
			},
			examples: ["reddit anime_irl", "reddit animemes top", "reddit animemes 8zf79f"],
			argsCount: 2,
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
				},
				{
					key: "number",
					prompt:"number of times to send a post",
					type: "integer",
					default: 1,
				}
			]

		});
	}


	async run(msg, { subreddit, text, number}) { // include videos (.webm till it supports it)
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
				let postCount = 0;
				db.prepare("DELETE FROM redditposted WHERE time_send < DATETIME('NOW', '-1 day')").run();

				const body = await fetch(`${redditAPI}/r/${subreddit}/${text}.json`)
					.then(res => res.json())
					.catch(err => (console.log(err)));

				const about = await fetch(`${redditAPI}/r/${subreddit}/about.json`)
					.then(res => res.json())
					.catch(err => (console.log(err)));

				if (number > body.data.children.length) {
					msg.channel.send(`Your request has been reduced to ${body.data.children.length}`);
					number = body.data.children.length;
				}

				for (let i = 0; i < body.data.children.length; i++) {
					for (let j = 0; j <= number; j++) {
						const data = body.data.children[i].data;

						if (checkSuitability(data)) {
							if (!(!about.data.over18 || msg.channel.nsfw)) return msg.channel.send("You cant chose a NSFW subweddit in a SFW channyew òwó");
							if (!(!data.over_18 || msg.channel.nsfw) || data.spoiler) continue; //hope this works like I want it to be

							let timePosted = new Date(msg.createdTimestamp).toISOString();
							let row = dbcheck.get(data.id, (msg.guild ? msg.guild.id : msg.author.id));
							if(!row) {
								dbinsert.run(null, data.subreddit, data.id, (msg.guild ? msg.guild.id : msg.author.id), timePosted);
							}else {
								continue;
							}

							msg.channel.send(await getEmbedData(data, about.data.icon_img, msg));
							postCount++;
						}
					}
					if (postCount === number) return console.log("succ reddit commad");
				}
				return msg.channel.send("Sowwy nyo Images found to post uwu");

			} else if(!isReddit) { // code for default which should be a subreddit and a comment
				const body = await fetch(`${redditAPI}/r/${subreddit}/comments/${text}.json`)
					.then(res => res.json())
					.catch(err => (console.log(err)));

				const about = await fetch(`${redditAPI}/r/${subreddit}/about.json`)
					.then(res => res.json())
					.catch(err => (console.log(err)));

				const data = body[0].data.children[0].data;

				if (checkSuitability(data))  {
					if (!(!about.data.over18 || msg.channel.nsfw)) return msg.channel.send("You cant chose a NSFW subweddit in a SFW channyew òwó");
					if (!(!data.over_18 || msg.channel.nsfw) || data.spoiler)  return msg.channel.send("You cant chose a NSFW subweddit in a SFW channyew òwó");

					return msg.channel.send(await getEmbedData(data, about.data.icon_img, msg));
				}
			}
			return msg.reply("I dont know what you did but you broke something");

		} catch (err) {
			console.error(err);
			if (err === "Error: 404 Not Found") return msg.reply("404. Subreddit or Comment not found please check the spelling");
			if (err === "Error: 403 Forbidden") return msg.reply("403 Forbidden. Dont know why <:Shrug:268687398966263809>"); // eslint-disable-line
			return msg.reply("Something went wrong.");
		}
	}
};
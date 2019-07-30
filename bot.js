const Discord = require('discord.js');
const client = new Discord.Client();
var modMailChannel = null
var publicShameChannel = null

client.on('ready', () => {
	modMailChannel = client.channels.get(process.env.MOD_MAIL) //Set modMailChannel from env
	publicShameChannel = client.channels.get(process.env.PUBLIC_SHAME)	//Set shame channel from env
	purgeOld()	//Kick any unverified more than a week old
	console.log('These boots were made for bootin`'); //Log that bot is up
});

//Filter for reaction tracking
const emojiReactFilter = (reaction, user) => {
	return ['👀', '🚫'].includes(reaction.emoji.name) && user.id !== client.user.id;
};

client.on('message', message => {
	if (message.author != client.user) { //Stop the bot replying to itself, we dont want it going crazy
		if (message.channel.type === 'dm') { //If the message is a DM, handle the complaint
			if (modMailChannel === null || modMailChannel === undefined) { //Error has occured during startup
				message.channel.send("This bot is temporarily down for maintenance")
			} else {
				var links = []

				if (message.attachments.size) { //If there is an image in the DM

					message.attachments.forEach(element => { //Attach all images
						links.push(element.url)
					});

					//Build a RichEmbed message
					const embed = new Discord.RichEmbed()
						.setTitle('Incoming report from ' + message.author.tag)
						.setColor('RANDOM')
						.setDescription('Time for judgement')
						.attachFiles(links)

					// Send the embed to the modmail channel
					modMailChannel.send(embed)
						.then(function (message) {
							//Add the 2 initial reacts
							message.react('👀')
							message.react('🚫')

							//Await for 1 reaction
							message.awaitReactions(emojiReactFilter, { max: 1 }).then(collected => {
								var reaction = collected.first()
								if (reaction.emoji.name === '👀') { //If eyes reaction, build new embed and attach old images, then forward to shame channel
									pics = []
									message.attachments.forEach(element => {
										pics.push(element.url)
									});
									publicShameChannel.send(new Discord.RichEmbed().setTitle('Checkout this fool who didn\'t respect tags').setColor('RANDOM').attachFiles(pics)).then(() => message.delete())
								} else if (reaction.emoji.name === '🚫') { //If delete, delete
									message.delete();
								}
							}).catch()
						})
					message.channel.send("Your report has successfully been recieved") //Tell the user that report had been successful
				}
			}
		}
	}
})

client.on('guildMemberRemove', member => {
	
})

/**
 * This method kicks any guildMembers with the unverified role who joined more than a week ago.
 */
function purgeOld() {

		var server = client.guilds.get(process.env.SERVER_ID)
		var members = server.roles.get(process.env.UNVERI_ID).members.map(m => m) //Builds array of all unverified

		var filtered = members.filter(function (member) {	//Build array of all unverified who are more than a week old
			return Date.now() - 604800000 > member.joinedTimestamp
		})
		let a = filtered.length
		filtered.forEach(member => { //Kicks all of the filtered members
			member.kick()
		});
		server.channels.get(process.env.KICK_REPORT).send(new Discord.RichEmbed()
												.setTitle('Weekly Boot').setColor('RED')
												.setDescription("Just kicked " + a + " unverified members"))

	}

client.login(process.env.BOT_TOKEN);
const Discord = require('discord.js');
const client = new Discord.Client();
var modMailChannel = null
var publicShameChannel = null

client.on('ready', () => {
	purgeOld()
	modMailChannel = client.channels.get(process.env.MOD_MAIL)
	publicShameChannel = client.channels.get(process.env.PUBLIC_SHAME)
	console.log('These boots were made for bootin`');
});

const emojiReactFilter = (reaction, user) => {
	return ['👀', '🚫'].includes(reaction.emoji.name) && user.id !== client.user.id;
};

client.on('message', message => {
	if (message.author != client.user) { //Stop the bot replying to itself, we dont want it going crazy
		if (message.channel.type === 'dm') { //If the message is a DM, handle the complaint
			if (modMailChannel === null || modMailChannel === undefined) { //Bot hasn't been started yet
				message.channel.send("This bot is temporarily down for maintenance")
			} else {
				var links = []

				if (message.attachments.size) {

					message.attachments.forEach(element => {
						links.push(element.url)
					});

					const embed = new Discord.RichEmbed()
						.setTitle('Incoming report from ' + message.author.tag)
						.setColor('RANDOM')
						.setDescription('Time for judgement')
						.attachFiles(links)

					// Send the embed to the modmail channel
					modMailChannel.send(embed)
						.then(function (message) {
							message.react('👀')
							message.react('🚫')

							message.awaitReactions(emojiReactFilter, { max: 1 }).then(collected => {
								var reaction = collected.first()
								if (reaction.emoji.name === '👀') {
									if (publicShameChannel === null) {
										modMailChannel.send("No public shame channel setup yet, start it with b!public in the desired channel")
									} else {
										pics = []
										message.attachments.forEach(element => {
											pics.push(element.url)
										});
										publicShameChannel.send(new Discord.RichEmbed().setTitle('Checkout this fool who didn\'t respect tags').setColor('RANDOM').attachFiles(pics)).then(() => message.delete())
									}
								} else if (reaction.emoji.name === '🚫') {
									message.delete();
								} else {
									modMailChannel.send('This is embarrassing, you should never be able to see this')
								}
							}).catch()
						})
				}
				message.channel.send("Your report has successfully been recieved")
			}
		}
	}
})

const getUnverfiedUsersFilter = (user) => {
	return user.roles.has(525448406273884162);
}

function purgeOld() {
	var members = client.guilds.get(525423041614839820).members
	members = members.filter(getUnverfiedUsersFilter)
	console.log("sending members")
	modMailChannel.send(members)
	console.log("members sent")
}

client.login(process.env.BOT_TOKEN);
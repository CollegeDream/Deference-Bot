const config = require("./config.json")
const fetch = require("node-fetch")
const fs = require("fs")
const { token, littleKey, port } = require('./config.json');

const Discord = require('discord.js');
const { measureMemory } = require("vm");
const { rejects } = require("assert");
const { error } = require("console");
const mongo = require('./mongo');
const { Mongoose } = require("mongoose");
const client = new Discord.Client({
  ws: { intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_PRESENCES', 'GUILD_MEMBERS']}
});
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));


client.on("ready", async () => {client.user.setActivity("&help")
  console.log('Bot is online!')
  await mongo().then(mongoose => {
    try {
      console.log('connected to mongoDB!')
    } finally {
      mongoose.connection.close()
    }
  })

})
//=>console.log(`${client.user.tag} is online!`)
client.on('guildMemberAdd', member => {
  let welcomeChannel = member.guild.channels.cache.get(config.welcomeChannel);
  const guild = client.guilds.cache.get(config.targetGuild);
  const welcomeEmbed = new Discord.MessageEmbed()
  .setColor('#fc0fb5')
  .setTitle('Welcome to Deference!🌟')
  .setDescription(`Hey ${member}, welcome to Deference's guild Discord server. Checkout <#686071200170246264> for information regarding our guild.\n
  To gain access, use &verify in <#688407471190310958>\n
  To apply, go to <#799876290642706473> and open a ticket.\n
  We now have \*\*${guild.memberCount}\*\* members.`)
  .setThumbnail(member.user.avatarURL())
  welcomeChannel.send(`${member}`);
  welcomeChannel.send(welcomeEmbed);
  var role = member.guild.roles.cache.find(role => role.id === config.discordMemberRole);
  member.roles.add(role);
});

client.on('guildMemberRemove', member => {
  member.guild.channels.cache.get(config.welcomeChannel).send(`\*\*${member.user.tag}\*\* left the server. Good luck out there!`);
});

client.on("message", async message => {
  //if(message.author.bot) return;
  

  //if(!message.guild || message.guild.id !== config.targetGuild) return;
    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    if(!message.content.startsWith(config.prefix)) return;

    for(const file of commandFiles){
      const command = require(`./commands/${file}`);
      client.commands.set(command.name, command);
    }

    if (!client.commands.has(command)) return;

    try {
      client.commands.get(command).execute(message, args);
    } catch (error) {
      console.error(error);
      message.reply('there was an error trying to execute that command!');
    }

    

})

//const token = fs.readFileSync(__dirname+"/./token.txt").toString()
client.login(littleKey)

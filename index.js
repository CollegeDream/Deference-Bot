const config = require("./config.json")
const fetch = require("node-fetch")
const fs = require("fs")
const { token, littleKey, port } = require('./config.json');
function getUUID(username) {
        return fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`)
        .then(data => data.json())
        .then((player) => {
          return player.id
        }).catch(e=>null);
}
async function getPlayer(username){
    const id = await getUUID(username)
return fetch(`https://api.hypixel.net/player?uuid=${id}&key=${config.apiKey}`)
.then(result => result.json())
.then(({player}) => {
    return player
}).catch(e=>null);
};

async function getGuild(username){
  const id = await getUUID(username);
  return fetch(`https://api.hypixel.net/findGuild?byUuid=${id}&key=${config.apiKey}`)
.then(result => result.json())
.then(({guild}) => {
    return guild
}).catch(e=>null);
};

async function guildInfo(guildID){
  return fetch(`https://api.hypixel.net/guild?key=${config.apiKey}&id=${guildID}`)
  .then(result => result.json())
  .then(({guild}) => {
    return guild
  }).catch(e=>console.log(e));
}


async function getLinkedDiscord(username){
    const user = await getPlayer(username)
    if(!user || !user.socialMedia || !user.socialMedia.links || !user.socialMedia.links.DISCORD) return null
    return user.socialMedia.links.DISCORD
}

async function getOnlineStatus(username){
  return fetch(`https://api.slothpixel.me/api/players/${username}/status`)
  .then(result => result.json())
  .then(({game}) => {
    return game
  }).catch(e=>console.log(e));
};


const Discord = require('discord.js');
const { measureMemory } = require("vm");
const { rejects } = require("assert");
const { error } = require("console");
const client = new Discord.Client({
  ws: { intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_PRESENCES', 'GUILD_MEMBERS']}
});
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));


client.on("ready", () => {client.user.setActivity("&help")})
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
  

  if(!message.guild || message.guild.id !== config.targetGuild) return;
    //const args = message.content.slice(config.prefix.length).split(/ +/g)
    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    if(!message.content.startsWith(config.prefix)) return;

    for(const file of commandFiles){
      const command = require(`./commands/${file}`);
      client.commands.set(command.name, command);
    }

    if(command === "verify"){
      client.commands.get('verify').execute(message, args);
    }

    if(command === "stats"){
      client.commands.get('stats').execute(message, args);
    }

    if(command === "g"){
      client.commands.get('guildInfo').execute(message, args);
    }

    if(command === "help"){
      message.channel.send('Bot in development, help command will be available later!\nCurrent commands:\n&verify\n&hug\n&test aliases\n&stats')
    }

    if(command === "test"){
      client.commands.get('alias').execute(message, args);
    }
    
    if(command === "hug"){
      client.commands.get('hug').execute(message, args);
    }



})

//const token = fs.readFileSync(__dirname+"/./token.txt").toString()
client.login(littleKey)

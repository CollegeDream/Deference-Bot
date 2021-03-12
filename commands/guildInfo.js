const config = require("../config.json")
const fetch = require("node-fetch")
const fs = require("fs");


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

module.exports = {
    name: 'guildInfo',
    description: 'get the guild of a player',
    async execute(message, args){
        if(!args[0]){
            return message.reply('provide an IGN.');
        } else {
            const username = args[0];
            const playerUUID = await getUUID(username);
            const guildID = await getGuild(username);
            const guild = await guildInfo(guildID).catch(e=>null);
            async function getExpHistory(username){
            const response = await fetch(`https://api.slothpixel.me/api/guilds/${username}`)
            const result = await response.json();
            let exp = result.members[80].exp_history;

            message.channel.send(exp);
            }
            //console.log('hey')
            //await getExpHistory(username); 
           
           // here is a comment
            
             for(i in guild.members) {
                if (guild.members[i].uuid === playerUUID) {
                    guildMember = guild.members[i]
                    message.channel.send(guildMember.rank);
                    for(x in guildMember.expHistory){
                        message.channel.send(guildMember.expHistory[x].date);
                    }
                }
            }
        }
    },
}

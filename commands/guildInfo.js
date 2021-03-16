const config = require("../config.json")
const fetch = require("node-fetch")
const fs = require("fs");
const QuickChart = require('quickchart-js');

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

const Discord = require('discord.js');

module.exports = {
    name: 'g',
    description: 'get the guild of a player',
    async execute(message, args){
        if(!args[0]){
            return message.reply('provide an IGN.');
        } else {
            const username = args[0];
            const playerUUID = await getUUID(username);
            const player = await getPlayer(username);
            const guildID = await getGuild(username);
            const guild = await guildInfo(guildID).catch(e=>null);
            //console.log('hey')
            //await getExpHistory(username); 
            var expArray = new Array();

            const myChart = new QuickChart();
                myChart
                .setWidth(800)
                .setHeight(400)
                .setBackgroundColor('transparent');


            const guild_Embed = new Discord.MessageEmbed()
                .setColor('#e6e609')
                .setTitle(`${player.displayname}\'s exp contribution:`)
                .setFooter('Bot is in development')
             for(i in guild.members) {
                if (guild.members[i].uuid === playerUUID) {
                    guildMember = guild.members[i];
                    for(x in guildMember.expHistory){
                        expArray.push(`${x}: \*\*${guildMember.expHistory[x]}\*\*`);
                        myChart.setConfig({
                            type: 'bar',
                            data: {
                                labels: ['Q4'],
                                datasets: [
                               {
                                  label: 'GEXP',
                                  data: [guildMember.expHistory[0], guildMember.expHistory[1], guildMember.expHistory[2], guildMember.expHistory[3], guildMember.expHistory[4], guildMember.expHistory[5], guildMember.expHistory[6]]
                                }]
                              }
                          })
                    }
                    
                }
            }
            guild_Embed.setImage(myChart.getUrl());
            guild_Embed.setDescription(expArray.join('\n'))
            message.channel.send(guild_Embed);
        }
    },
}

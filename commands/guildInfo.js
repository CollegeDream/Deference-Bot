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
            var expArray_2 = new Array();
            var dateArray = new Array();
            const myChart = new QuickChart();
                myChart
                .setWidth(1000)
                .setHeight(500)
                .setFormat('png')
                .setBackgroundColor('transparent')


            const guild_Embed = new Discord.MessageEmbed()
                .setColor('#e0cf12')
                .setTitle(`${player.displayname}\'s exp contribution:`)
                .setFooter('Bot is in development')
             for(i in guild.members) {
                if (guild.members[i].uuid === playerUUID) {
                    guildMember = guild.members[i];
                    for(x in guildMember.expHistory){
                        expArray.push(`${x}: \*\*${guildMember.expHistory[x]}\*\*`);
                        dateArray.push(x);
                        expArray_2.push(guildMember.expHistory[x]);
                    }
                    myChart.setConfig({
                        type: 'bar',
                        data: {
                            labels: dateArray.reverse(),
                            
                            datasets: [
                           {
                                type: 'line',
                                label: 'GEXP',
                                offset: false,
                                borderColor: 'rgb(18, 224, 32)',
                                backgroundColor: 'rgb(18, 224, 32, 0.25)',
                                data: expArray_2.reverse(),

                            }]
                          },
                          scales: {
                            xAxes:[{
                                offset: false
                            }]
                        }
                      })
                    
                }
            }
            guild_Embed.setImage(myChart.getUrl());
            guild_Embed.setDescription(expArray.join('\n'))
            message.channel.send(guild_Embed);
        }
    },
}


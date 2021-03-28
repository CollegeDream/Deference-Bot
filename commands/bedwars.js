const mongo = require('../mongo')
const Discord = require('discord.js')
const fetch = require('node-fetch')
const fs = require('fs')
const config = require('../config.json')
const getUUID = require('../Schemas/saveUUID')
const { get } = require('mongoose')



module.exports = {
    name: 'bw',
    description: 'get player\'s Bedwars stats',
    cooldown: 6,
    async execute(message, args){
        var uuid = '9a3e0e10010d4867ae976982d7d60609'
        message.channel.send('Command will be coming soon!')
        //fetch UUID from database, if UUID doesn't exist ask the user to enter IGN

        //get the player object from API
        
        async function getPlayer(uuid){
            return fetch(`https://api.hypixel.net/player?uuid=${uuid}&key=${config.apiKey}`)
            .then(response => response.json())
            .then(({player})=>{
                return player
            }).catch(e=>console.log(e));
        }

        //useful constants
        const player = await getPlayer(uuid);
        const username = player.displayname;
        const {Bedwars} = player.stats;

        //create an embed object here
        (async function (player){
        const bedwars_stats = new Discord.MessageEmbed()
            .setColor('#e82e20')
            .setAuthor(`Player → ${player.displayname} → Bedwars`)
            .setThumbnail(`https://crafatar.com/avatars/${player.uuid}`)
            .setTitle(`(${player.achievements.bedwars_level}★) ${username}`)
            .setURL(`https://plancke.io/hypixel/player/stats/${username}`)
            //add fields to the embed object
            let prestige = await getBedWarsPrestige(player.achievements.bedwars_level);
            bedwars_stats.addField('\*\*Prestige\*\*', prestige, true)
            bedwars_stats.addField('\*\*Games played\*\*', Bedwars.games_played_bedwars, true)
            bedwars_stats.addField('\*\*Coins\*\*', Bedwars.coins, true)
            //this is an over-complication, just do a normal array
            let resource_collection = {Iron: Bedwars.iron_resources_collected_bedwars, Gold: Bedwars.gold_resources_collected_bedwars, Diamond: Bedwars.diamond_resources_collected_bedwars, Emerald: Bedwars.emerald_resources_collected_bedwars};
            let resource_array = [];
            for(resource in resource_collection){
                resource_array.push(`${resource}: \*\*${resource_collection[resource]}\*\*`)
            }
            bedwars_stats.addField('\*\*Items collected\*\*', `${resource_array.join('\n')}`, true)
            bedwars_stats.addField('\*\*Winstreak\*\*', Bedwars.winstreak, true)
            bedwars_stats.addField('\*\*Items purchased\*\*', Bedwars.items_purchased_bedwars, true)
            message.channel.send(bedwars_stats);
        })(player);
        
        async function getBedWarsPrestige(level){
            // eslint-disable-next-line max-len
            return ['None', 'Iron', 'Gold', 'Diamond', 'Emerald', 'Sapphire', 'Ruby', 'Crystal', 'Opal', 'Amethyst', 'Rainbow', 'Iron Prime', 'Gold Prime', 'Diamond Prime', 'Emerald Prime', 
            'Sapphire Prime', 'Ruby Prime', 'Crystal Prime', 'Opal Prime', 'Amethyst Prime', 'Mirror', 'Light', 'Dawn', 'Dusk', 'Air', 'Wind', 'Nebula', 'Thunder', 'Earth', 'Water', 'Fire'][Math.floor(level / 100)] || 'Rainbow';
        }
    },
}

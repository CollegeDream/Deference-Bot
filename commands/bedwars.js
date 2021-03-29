
const Discord = require('discord.js')
const fetch = require('node-fetch')
const fs = require('fs')
const config = require('../config.json')
const saveUUID = require('../Schemas/saveUUID')
const mongo = require('../mongo')
const { get } = require('mongoose')
const plusColor = require('./plusColor')


module.exports = {
    name: 'bw',
    description: 'get player\'s Bedwars stats',
    cooldown: 6,
    async execute(message, args){
        var uuid;
        
        //fetch UUID from database, if UUID doesn't exist ask the user to enter IGN
        await mongo().then(async (mongoose) => {
            try{
                author = await saveUUID.findOne({_id: message.author.id}, (err)=>{
                    if(err){
                        message.channel.send('Error occured: ' + err)
                    }
                })
                if(author){
                    uuid = author.uuid;
                }
            } finally {
                mongoose.connection.close()
            }
        });

        (async function retrivePlayer(uuid){
            if(args[0]){
                let player = await getPlayerWithName(args[0]);
                if (!player){
                    message.channel.send('This player does not exist!');
                } else {
                    getBedwarsStats(player);
                }
            } else {
                if(uuid){
                    let player = await getPlayerWithID(uuid);
                    getBedwarsStats(player);
                } else {
                    message.channel.send('Provide an IGN, or use \`&register\` to use \`&bw\` with no arguments')
                }
            }
        })(uuid);
        //get the player object from API
        function getUUID(username) {
            return fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`)
            .then(data => data.json())
            .then((player) => {
              return player.id
            }).catch(e=>null);
        }
        
        async function getPlayerWithID(uuid){
            return fetch(`https://api.hypixel.net/player?uuid=${uuid}&key=${config.apiKey}`)
            .then(response => response.json())
            .then(({player})=>{
                return player
            }).catch(e=>console.log(e));
        }

        async function getPlayerWithName(username){
            const id = await getUUID(username)
            return fetch(`https://api.hypixel.net/player?uuid=${id}&key=${config.apiKey}`)
            .then(result => result.json())
            .then(({player}) => {
            return player
        }).catch(e=>null);
        };
        
        //create an embed object here
        async function getBedwarsStats(player){
            const username = player.displayname;
            const {Bedwars} = player.stats;
            let plusColor_2;
            if(player.rankPlusColor){
                plusColor_2 = await plusColor(player.rankPlusColor.replace(/_/g, ""));
            } else {
                plusColor_2 = '36393E'
            }
          
            const bedwars_stats = new Discord.MessageEmbed()
            .setColor(`${plusColor_2}`)
            .setAuthor(`Player → ${player.displayname} → Bedwars`, `https://crafatar.com/avatars/${player.uuid}`)
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
            bedwars_stats.addField('\u200B', '\u200B', false)

            let kills_deaths = {
                'Overall': `${Bedwars.kills_bedwars} | ${Bedwars.deaths_bedwars}`,
                'Solo': `${Bedwars.eight_one_kills_bedwars} | ${Bedwars.eight_one_deaths_bedwars}`,
                'Double': `${Bedwars.eight_two_kills_bedwars} | ${Bedwars.eight_two_deaths_bedwars}`,
                '3v3v3v3':  `${Bedwars.four_three_kills_bedwars} | ${Bedwars.four_three_deaths_bedwars}`,
                '4v4v4v4': `${Bedwars.four_four_kills_bedwars} | ${Bedwars.four_four_deaths_bedwars}`,
            }
            let kills_deaths_array = [];
            for(mode in kills_deaths){
                kills_deaths_array.push(`\*\*${mode}:\*\* ${kills_deaths[mode]}`)
            }
            bedwars_stats.addField('\*\*Kills | Deaths\*\*', kills_deaths_array.join('\n'), true)
            
            let finals = {
                'Overall': `${Bedwars.final_kills_bedwars} | ${Bedwars.final_deaths_bedwars}`,
                'Solo': `${Bedwars.eight_one_final_kills_bedwars} | ${Bedwars.eight_one_final_deaths_bedwars}`,
                'Double': `${Bedwars.eight_two_final_kills_bedwars} | ${Bedwars.eight_two_final_deaths_bedwars}`,
                '3v3v3v3': `${Bedwars.four_three_final_kills_bedwars} | ${Bedwars.four_three_final_deaths_bedwars}`,
                '4v4v4v4': `${Bedwars.four_four_final_kills_bedwars} | ${Bedwars.four_four_final_deaths_bedwars}`,
            }
            let final_array = []
            for(mode in finals){
                final_array.push(`\*\*${mode}:\*\* ${finals[mode]}`)
            }
            bedwars_stats.addField(`\*\*Final K|D\*\*`, final_array.join('\n'), true)

            let fkd_ratios = {
                'Overall': Bedwars.final_kills_bedwars / Bedwars.final_deaths_bedwars,
                'Solo': Bedwars.eight_one_final_kills_bedwars / Bedwars.eight_one_final_deaths_bedwars,
                'Double': Bedwars.eight_two_final_kills_bedwars / Bedwars.eight_two_final_deaths_bedwars,
                '3v3v3v3': Bedwars.four_three_final_kills_bedwars / Bedwars.four_three_final_deaths_bedwars,
                '4v4v4v4': Bedwars.four_four_final_kills_bedwars / Bedwars.four_four_final_deaths_bedwars,
            }
            let fkdr_array = []
            for(mode in fkd_ratios){
                fkdr_array.push(`\*\*${mode}:\*\* ${fkd_ratios[mode].toFixed(2)}`)
            }
            bedwars_stats.addField('\*\*FKDR\*\*', fkdr_array.join('\n'), true)
            message.channel.send(bedwars_stats);
        };
        
        async function getBedWarsPrestige(level){
            // eslint-disable-next-line max-len
            return ['None', 'Iron', 'Gold', 'Diamond', 'Emerald', 'Sapphire', 'Ruby', 'Crystal', 'Opal', 'Amethyst', 'Rainbow', 'Iron Prime', 'Gold Prime', 'Diamond Prime', 'Emerald Prime', 
            'Sapphire Prime', 'Ruby Prime', 'Crystal Prime', 'Opal Prime', 'Amethyst Prime', 'Mirror', 'Light', 'Dawn', 'Dusk', 'Air', 'Wind', 'Nebula', 'Thunder', 'Earth', 'Water', 'Fire'][Math.floor(level / 100)] || 'Rainbow';
        }
    },
}

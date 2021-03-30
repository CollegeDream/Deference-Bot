
const Discord = require('discord.js')
const fetch = require('node-fetch')
const fs = require('fs')
const config = require('../config.json')
const saveUUID = require('../Schemas/saveUUID')
const mongo = require('../mongo')
const { get } = require('mongoose')
const plusColor = require('./plusColor')
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants')


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

            let kills = [
                {'Overall': Bedwars.kills_bedwars || 0},
                {'Solo': Bedwars.eight_one_kills_bedwars || 0},
                {'Double': Bedwars.eight_two_kills_bedwars || 0},
                {'3v3v3v3': Bedwars.four_three_kills_bedwars || 0},
                {'4v4v4v4': Bedwars.four_four_kills_bedwars || 0},
            ]

            let deaths = [
                {'Overall': Bedwars.deaths_bedwars || 0},
                {'Solo': Bedwars.eight_one_deaths_bedwars || 0},
                {'Double': Bedwars.eight_two_deaths_bedwars || 0},
                {'3v3v3v3': Bedwars.four_three_deaths_bedwars || 0},
                {'4v4v4v4': Bedwars.four_four_deaths_bedwars || 0},
            ]
            let kills_deaths_array = [];
            for(let i = 0; i < kills.length; i++){
                for(let mode in kills[i]){
                    kills_deaths_array.push(`${mode}: ${kills[i][mode]} | ${deaths[i][mode]}`)
                }
            }
            bedwars_stats.addField('\*\*Kills | Deaths\*\*', kills_deaths_array.join('\n'), true)
            
            let final_kills = [
                {'Overall': Bedwars.final_kills_bedwars || 0},
                {'Solo': Bedwars.eight_one_final_kills_bedwars || 0},
                {'Double': Bedwars.eight_two_final_kills_bedwars || 0},
                {'3v3v3v3': Bedwars.four_three_final_kills_bedwars || 0},
                {'4v4v4v4': Bedwars.four_four_final_kills_bedwars ||0},
            ]

            let final_deaths = [
                {'Overall': Bedwars.final_deaths_bedwars || 0},
                {'Solo': Bedwars.eight_one_final_deaths_bedwars || 0},
                {'Double': Bedwars.eight_two_final_deaths_bedwars || 0},
                {'3v3v3v3': Bedwars.four_three_final_deaths_bedwars || 0},
                {'4v4v4v4': Bedwars.four_four_final_deaths_bedwars || 0},
            ]
            
            let final_array = [];
            let fkdr = [];
            for(let i = 0; i < final_kills.length; i++){
                for(let mode in final_kills[i]){
                    let ratio = ((final_kills[i][mode])/(final_deaths[i][mode] || 1)).toFixed(2);
                    final_array.push(`${mode}: ${final_kills[i][mode]} | ${final_deaths[i][mode]}`)
                    fkdr.push(`${mode}: ${ratio}`)
                }
            }
            
            bedwars_stats.addField(`\*\*Finals K|D\*\*`, final_array.join('\n'), true)
            bedwars_stats.addField(`\*\*FKDR\*\*`, fkdr.join('\n'), true)

            let wins = [
                {'Overall': Bedwars.wins_bedwars || 0},
                {'Solo': Bedwars.eight_one_wins_bedwars || 0},
                {'Double': Bedwars.eight_two_wins_bedwars || 0},
                {'3v3v3v3': Bedwars.four_three_wins_bedwars || 0},
                {'4v4v4v4': Bedwars.four_four_wins_bedwars || 0},
            ]

            let losses = [
                {'Overall': Bedwars.losses_bedwars || 0},
                {'Solo': Bedwars.eight_one_losses_bedwars || 0},
                {'Double': Bedwars.eight_two_losses_bedwars || 0},
                {'3v3v3v3': Bedwars.four_three_losses_bedwars || 0},
                {'4v4v4v4': Bedwars.four_four_losses_bedwars || 0},
            ]
            
            let win_loss_array = [];
            let win_loss_ratio = [];

            for(let i = 0; i < wins.length; i++){
                for(let mode in wins[i]){
                    let ratio = ((wins[i][mode])/(losses[i][mode] || 1)).toFixed(2);
                    win_loss_array.push(`${mode}: ${wins[i][mode]} | ${losses[i][mode]}`)
                    win_loss_ratio.push(`${mode}: ${ratio}`)
                }
            }
            bedwars_stats.addField('\*\*Wins | Losses\*\*', win_loss_array.join('\n'), true)
            bedwars_stats.addField('\*\*W | L Ratio\*\*', win_loss_ratio.join('\n'), true)
            bedwars_stats.addField('\u200B', '\u200B', true)
            
            
            let beds_broken = [
                {'Overall': Bedwars.beds_broken_bedwars || 0},
                {'Solo': Bedwars.eight_one_beds_broken_bedwars || 0},
                {'Double': Bedwars.eight_two_beds_broken_bedwars || 0},
                {'3v3v3v3': Bedwars.four_three_beds_broken_bedwars || 0},
                {'4v4v4v4': Bedwars.four_four_beds_broken_bedwars || 0},
            ]

            let beds_lost = [
                {'Overall': Bedwars.beds_lost_bedwars || 0},
                {'Solo': Bedwars.eight_one_beds_lost_bedwars || 0},
                {'Double': Bedwars.eight_two_beds_lost_bedwars || 0},
                {'3v3v3v3': Bedwars.four_three_beds_lost_bedwars || 0},
                {'4v4v4v4': Bedwars.four_four_beds_lost_bedwars || 0},
            ]

            let beds_broken_lost = [];
            let beds_ratio = [];

            for(let i = 0; i < beds_broken.length; i++){
                for(let mode in beds_broken[i]){
                    let ratio = ((beds_broken[i][mode])/(beds_lost[i][mode] || 1)).toFixed(2);
                    beds_broken_lost.push(`${mode}: ${beds_broken[i][mode]} | ${beds_lost[i][mode]}`)
                    beds_ratio.push(`${mode}: ${ratio}`)
                }
            }

            bedwars_stats.addField('\*\*Beds B | L\*\*', beds_broken_lost.join('\n'), true)
            bedwars_stats.addField('\*\*B | L Ratio\*\*', beds_ratio.join('\n'), true)
            bedwars_stats.addField('\u200B', '\u200B', true)

            message.channel.send(bedwars_stats);
        };
        
        async function getBedWarsPrestige(level){
            // eslint-disable-next-line max-len
            return ['None', 'Iron', 'Gold', 'Diamond', 'Emerald', 'Sapphire', 'Ruby', 'Crystal', 'Opal', 'Amethyst', 'Rainbow', 'Iron Prime', 'Gold Prime', 'Diamond Prime', 'Emerald Prime', 
            'Sapphire Prime', 'Ruby Prime', 'Crystal Prime', 'Opal Prime', 'Amethyst Prime', 'Mirror', 'Light', 'Dawn', 'Dusk', 'Air', 'Wind', 'Nebula', 'Thunder', 'Earth', 'Water', 'Fire'][Math.floor(level / 100)] || 'Rainbow';
        }
    },
}

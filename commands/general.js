const fetch = require('node-fetch')
const Discord = require('discord.js')
const mongo = require('../mongo')
const config = require('../config.json')
const saveUUID = require('../Schemas/saveUUID')
const Hypixel = require('hypixel-api-reborn');
const hypixel = new Hypixel.Client(config.apiKey);


module.exports = {
    name: 'hypixel',
    description: 'returns a players general stats',
    cooldown: 6,
    async execute(message, args){
        async function getDataFromDB(authorID){
            return await mongo().then(async (mongoose) => {
                return saveUUID.findOne({_id: authorID})
                    .then(res=>res)
                    .catch(err=>err)
            })   
        }
        const data = await getDataFromDB(message.author.id).catch(e=>console.log(e));

        async function getPlayer(username){
            if(username){
                let player = await getPlayerWithName(username).catch(e=>console.log(e));
                if(player){
                    return player;
                } else {
                    return message.channel.send('This player does not exist!');
                }
            } else {
                if(data){
                    return await getPlayerWithID(data.uuid);
                } else {
                    return message.channel.send('Provide an IGN, or use \`&register\` to use \`&hypixel\` with no arguments')
                }
            }
        }

        function getUUID(username) {
            return fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`)
            .then(data => data.json())
            .then((player) => {
              return player.id
            }).catch(e=>null);
        }

        async function getPlayerWithName(username){
            const id = await getUUID(username)
            return fetch(`https://api.hypixel.net/player?uuid=${id}&key=${config.apiKey}`)
            .then(result => result.json())
            .then(({player}) => {
            return player
        }).catch(e=>null);
        };

        async function getPlayerWithID(uuid){
            return fetch(`https://api.hypixel.net/player?uuid=${uuid}&key=${config.apiKey}`)
            .then(response => response.json())
            .then(({player})=>{
                return player
            }).catch(e=>console.log(e));
        }

        const player = await getPlayer(args[0]).catch(e=>console.log(e));
        

        //const status = await hypixel.getStatus('sonofaplatypus').catch(e => console.error(e));
        //console.log(status.game.game);

    }
    
}
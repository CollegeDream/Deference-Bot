const config = require("../config.json")
const fetch = require("node-fetch")
const mongo = require('../mongo')
const saveUUID = require('../Schemas/saveUUID')
const { execute } = require('./guildInfo')

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

module.exports = {
    name: 'register',
    description: 'to save a player\' uuid into db',
    async execute(message, args){
        let playerUUID;
        if(args[0]){
            playerUUID = await getUUID(args[0]).catch(err=>console.log(err))
            player = await getPlayer(args[0]).catch(err=>console.log(err))
            ign = player.displayname
        }
        if(playerUUID){
        await mongo().then(async (mongoose) => {
            try{
                await saveUUID.findOneAndUpdate(
                {
                    _id: message.author.id
                },
                {
                    _id: message.author.id,
                    uuid: playerUUID,
                    ign: ign,
                },
                {
                    upsert: true
                },
                (err) => {
                    if(err){
                        message.channel.send('An error occured updating the database!')
                    }
                    message.channel.send('Update successful')
                })   
            } finally {
                mongoose.connection.close()
                
            }
        })
    } else {
        message.reply('You need to provide an IGN!')
    } 
    }
}
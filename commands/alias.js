const config = require("../config.json")
const fetch = require("node-fetch")
const fs = require("fs")

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
    name: 'test',
    description: 'print player\'s aliases',
    async execute(message, args){
        if(!args.length){
            return message.channel.send('no argument provided');
          } else if (args[0] === "aliases"){
            if(!args[1]){
              message.channel.send(`Provide a username, ${message.author.toString()}`)
            } else if(args[1].toLowerCase() === "collegedream"){
              return message.channel.send('.')
            } else {
              const IGN = args[1];
              const playerUUID = await getUUID(IGN);
              //if(!playerUUID){
              //  message.channel.send('Could not find a player with this IGN');
             // } else {
              const player = await getPlayer(IGN);
              var myArray = player.knownAliases;
                
              let msg;
              async function printAliases(myArray){
                var myArray = player.knownAliases;
                msg = message.channel.send('\`Calculating...\`')
              
              await new Promise((resolve, reject)=>{
                setTimeout(function(){resolve(msg)}, 1000);
              }).then((msg) => msg.edit('\`Estimated time: 2 seconds\`'));
                return myArray;
              }
    
              
              async function sending(){
                
                let thirdArray = await printAliases(myArray);
                await new Promise((resolve, reject)=>{
                  setTimeout(function(){resolve(msg)}, 2000);
                }).then((msg) => msg.edit('\`Sending the name!\`'))
                await new Promise((resolve, reject)=>{
                  setTimeout(function(){resolve(msg)}, 150);
                }).then((msg) => msg.delete())
                message.channel.send(thirdArray.join('\n'))
              }
    
              await sending();
              
    
          }
        }
    },
}
module.exports = {
    name: 'hug',
    description: 'send the hug message',
    async execute(message, args){
        let replies = ["You are wonderful!", 
        "You are enough!",
        "You are loved!",
        "Everything about you makes me happy!",
        `I love you, ${message.author.toString()}!`,
        "You are my sunshine!",
        "Being around you makes my whole day!",
        "Here's a free hug, next one costs $2.00",
        "Believe in yourself!",
        "I just wanna sit next to you until forever!",
        "You are unique! Embrace who you are.",
        "You bring out the best in other people!",
        "You're more fun than bubble wrap!",
        "Our community is better when you're in it!",
        "I bet you do crossword puzzles in ink! (you're confident)",
        `${message.author.toString()}, I'm proud of you!`,
        "You melt my heart whenever I see you!",
        "You make me gay! (gay as in happy ofc)"

      ];
      message.channel.send(replies[Math.floor(Math.random() * replies.length)]).then((message) => {
        message.react('🤗');
      }).catch(err => {console.log(err);})
    },
}
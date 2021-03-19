const mongoose = require('mongoose')
//const {mongoPath} = require('./config.json')

const mongoPath = 'mongodb+srv://Mint:C3BCYY2ZShrkRgJW@realmcluster.smdnk.mongodb.net/DeferenceBot?retryWrites=true&w=majority'

module.exports = async () => {
    await mongoose.connect(mongoPath, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    return mongoose
}
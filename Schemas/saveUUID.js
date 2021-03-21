const mongoose = require('mongoose')

const reqString = {
    type: String,
    required: true
}

const saveUUID = mongoose.Schema({
    _id: reqString,
    uuid: reqString,
    ign: reqString,
})

module.exports = mongoose.model('savePlayerID', saveUUID)
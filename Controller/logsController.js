const logs = require('../Model/logsModel')
const asyncHandler = require('express-async-handler')

exports.getLogs = asyncHandler(async(req,res)=>{
    try {
        const response = await logs.find()
        res.json(response)
    } catch (error) {
        console.error(error)
    }
})
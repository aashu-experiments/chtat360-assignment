require('dotenv').config();
const API_URL_ARRAY = require("../constants/apiUrls");
const writeToLogFile = require("./writeToLogFile");
const loggingLevel = process.env.LOGGING_LEVEL;
const axios = require("axios");
const path = require('path');

async function makeApiCalls(){
    let filePath = process.env.LOG_FILE_PATH;
    filePath =  path.join(__dirname, ".."  ,filePath);
    let apiCallCount = 0;

    while(apiCallCount < API_URL_ARRAY.length){
        try {
            const response = await axios.get(API_URL_ARRAY[apiCallCount]);

            if(apiCallCount % 2 == 0){
                writeToLogFile(loggingLevel, "API call done", new Date().toISOString(), API_URL_ARRAY[apiCallCount], filePath+"/log"+(apiCallCount+1)+".log");
            }
            else{
                writeToLogFile("error", "Failed to connect", new Date().toISOString(), API_URL_ARRAY[apiCallCount], filePath+"/log"+(apiCallCount+1)+".log");
            }

        } catch (error) {
            writeToLogFile("error", error, new Date().toISOString(), API_URL_ARRAY[apiCallCount], filePath+"/log"+(apiCallCount+1)+".log");
        }
        apiCallCount++;
    }
}

module.exports = makeApiCalls;
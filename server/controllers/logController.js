require("dotenv").config();
const fs = require('fs');
const path = require('path');

const redisClient = {}

const logFilter = async(req,res) => {
    try {
        const filterProperty = req.query.property;
        const filterValue = req.query.value

        if (!filterProperty || !filterValue) {
            return res.status(400).json({ error: 'Property to filter by is missing in the request' });
        }

        //caching
        const cacheKey = `${filterProperty}:${filterValue}`;
        const cacheValue = redisClient[cacheKey];

        //if value is present in cache
        if(cacheValue){
            console.log("yes");
            return res.status(200).json({
            msg: "logs filtered on the basis of "+ filterProperty + "=" + filterValue,
            result: JSON.parse(cacheValue),
            });
        }

        const logsDirectory = path.join(__dirname, ".." , process.env.LOG_FILE_PATH); 
        const filteredLogs = [];

        fs.readdirSync(logsDirectory).forEach((file) => {
            if (path.extname(file) === '.log') {
                const filePath = path.join(logsDirectory, file);
                let fileContent = fs.readFileSync(filePath, 'utf-8');
                fileContent = JSON.parse(fileContent)
                console.log(fileContent[filterProperty].source);
                if(filterProperty == "metadata"){
                    if( new RegExp(filterValue, 'i').test(fileContent[filterProperty].source)){
                    filteredLogs.push(fileContent);
                }
                }
                else if(new RegExp(filterValue, 'i').test(fileContent[filterProperty])){
                    filteredLogs.push(fileContent);
                }

            }
        });

        //in case of cache miss, add it to cache if filtered logs are not empty
        if(filteredLogs.length > 0){
            // redisClient.set(cacheKey, JSON.stringify(filteredLogs));
            redisClient[cacheKey] = JSON.stringify(filteredLogs)
            // redisClient.expire(cacheKey, 3600) //setting TTL to 1 hour
        }

        return res.status(200).json({
            msg: "logs filtered on the basis of "+ filterProperty + "=" + filterValue,
            result: filteredLogs,
        });
    } catch (error) {
        return res.status(500).json({
            msg: "error occured",
            result: error,
        });
    }
}

const logFilterByTimestamp = async(req,res) => {
    try {
        const filterProperty = req.query.property;
        const startTime = req.query.startTimeValue; 
        const endTime = req.query.endTimeValue;  

        if (!filterProperty || !startTime || !endTime) {
            return res.status(400).json({ error: 'Property to filter by is missing in the request' });
        }

        const cacheKey = `${filterProperty}: ${startTime} and ${endTime}`;
        const cacheValue = redisClient[cacheKey];
        console.log(cacheValue);

        //if value is cached
        if(cacheValue){
            console.log("timestamp yes");
            return res.status(200).json({
            msg: "logs filtered on the basis of "+ filterProperty,
            result: JSON.parse(cacheValue),
            });
        }

        const logsDirectory = path.join(__dirname, ".." , process.env.LOG_FILE_PATH); 
        const filteredLogs = [];

        // Convert start and end time to milliseconds
        const startTimestamp = new Date(startTime).getTime();
        const endTimestamp = new Date(endTime).getTime();

        fs.readdirSync(logsDirectory).forEach((file) => {
            if (path.extname(file) === '.log') {
                const filePath = path.join(logsDirectory, file);
                let fileContent = fs.readFileSync(filePath, 'utf-8');
                fileContent = JSON.parse(fileContent)
                console.log(fileContent[filterProperty]);
                const currentTimestamp = new Date(fileContent[filterProperty]).getTime();
                if(currentTimestamp >= startTimestamp && currentTimestamp <= endTimestamp){
                    filteredLogs.push(fileContent);
                }

            }
        });

        ///in case of cache miss, add it to cache if filtered logs are not empty
       if(filteredLogs.length > 0){
            // redisClient.set(cacheKey, JSON.stringify(filteredLogs));
            redisClient[cacheKey] = JSON.stringify(filteredLogs)
            // redisClient.expire(cacheKey, 3600) //setting TTL to 1 hour
        }

        return res.status(200).json({
            msg: "logs filtered on the basis of "+ filterProperty,
            result: filteredLogs
        });
    } catch (error) {
        return res.status(500).json({
            msg: "error occured",
            result: error,
        });
    }
}

const multipleFilter = async(req,res) => {
    try {
        const filterObj = req.body;
        console.log(filterObj);
        if(!filterObj){
            return res.status(400).json({ error: 'Property to filter by is missing in the request body' });
        }

        const filteredLogs = [];
        const logsDirectory = path.join(__dirname, ".." , process.env.LOG_FILE_PATH); 
            

        const cacheKey = JSON.stringify(filterObj);
        const cacheValue = redisClient[cacheKey];

        //if value is cached
        if(cacheValue){
            console.log("yes");
            return res.status(200).json({
            msg: "logs filtered on the basis of multiple filters",
            result: JSON.parse(cacheValue),
            });
        }


        fs.readdirSync(logsDirectory).forEach((file) => {
            if (path.extname(file) === '.log') {
                const filePath = path.join(logsDirectory, file);
                let fileContent = fs.readFileSync(filePath, 'utf-8');
                fileContent = JSON.parse(fileContent)
                let matchCount = 0;
                filterObj.forEach((obj) => {
                    if(obj.property == "metadata"){
                        if(new RegExp(obj.value, "i").test(fileContent[obj.property].source)) matchCount++;
                    }
                    else if(new RegExp(obj.value, "i").test(fileContent[obj.property])) matchCount++;
                })
                console.log(matchCount);
                if(matchCount === filterObj.length) filteredLogs.push(fileContent);

            }
    
        });

        if(filteredLogs.length > 0){
            // redisClient.set(cacheKey, JSON.stringify(filteredLogs));
            redisClient[cacheKey] = JSON.stringify(filteredLogs)
            // redisClient.expire(cacheKey, 3600) //setting TTL to 1 hour
        }

        return res.status(200).json({
            msg: "logs filtered on the basis of muliple filters",
            result: filteredLogs
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: "error occured",
            result: error,
        });
        
    }


}


module.exports = {
    logFilter,
    logFilterByTimestamp,
    multipleFilter
}
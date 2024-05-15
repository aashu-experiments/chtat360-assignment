const fs = require('fs');
const dotenv = require('dotenv').config();



function ensureDirectoryExistence(filePath) {
    const dirname = require('path').dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}



function writeToLogFile(logLevel, logMessage, timestamp, source, filePath) {

    console.log(filePath);
    ensureDirectoryExistence(filePath);
    //construct the log data object
    const logData = {
        "log_level": logLevel,
        "log_message": logMessage,
        "timestamp": timestamp,
        "metadata": {
            "source": source
        }
    };

    //use null and 4 for pretty formatting
    const logString = JSON.stringify(logData, null, 4); 


    fs.writeFile(filePath, logString + '\n', { flag: 'w' }, (err) => {
        if (err) {
            console.error('Error writing to log file:', err);
        } else {
            console.log('Log data successfully written to log file:', filePath);
        }
    });
}

module.exports = writeToLogFile;
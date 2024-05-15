const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;
const makeApiCalls = require("./utils/makeApiCalls");
const apiRoutes = require("./routes/index");


const setUpAndStartServer = async ()=>{

    app.use(cors());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended : true}));

    //make API calls
    makeApiCalls();

    // routes for filtering out the logs
    app.use("/api", apiRoutes);
    
    
    app.listen(PORT,()=>{
        console.log(`Server is listening on ${PORT}`);
    })
}

setUpAndStartServer()

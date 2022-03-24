const CLASSNAME = "ServerController";
const express = require('express');
const bodyParser = require("body-parser");
//const router = express.Router();
const path = require('path');
const { errTracer, PROJECTDIR } = require('./utilities');
//const app = express();
const nCinoXML = require('./ncinoxml');
const OutputBuilder = require('./outputbuilder');

module.exports = (() => {
    let _ = new WeakMap();
    /**
     * Sets up backend server and routes for the process
     */
    class ServerController{
        /**
         * Creates necessary Express objects for setting up a server and endpoints
         */
        constructor(){
            try{
                let obj = {
                    latestData : "",
                    router : express.Router(),
                    app : express()
                }
                _.set(this,obj);
            }catch(err){ errTracer(CLASSNAME,'constructor',err); }
        }
        /**
         * Setup server using objects instantiated in constructed
         */
        setupServer(){   
            try{
                _.get(this).app.use("/", _.get(this).router);
                //app.use(express.json());
                //app.use(express.static("express"));
                _.get(this).app.use(bodyParser.urlencoded({ extended: false }));
                _.get(this).app.use(bodyParser.json());
                this.setupRoutes();
            }catch(err){ errTracer(CLASSNAME,'setupServer',err); }      
        }
        /**
         * Setup individual routes. Should only really ever be called by setupServer
         */
        setupRoutes(){
            try{
                _.get(this).router.get('/',(req,res) => {
                    res.sendFile(path.join(PROJECTDIR+'/index.html'));
                    //code to perform particular action.
                    //To access GET variable use req.query() and req.params() methods.
                });
                _.get(this).router.get("/getFields",(req,res) =>{
                    res.end(nCinoXML.getFieldList().join(','))
                })
            
                //Here we are configuring express to use body-parser as middle-ware.
                _.get(this).router.post('/getTable/:startDate/:endDate/:errorChecked/:fieldList',(req,res) => {
                    //code to perform particular action.
                    //To access POST variable use req.body()methods.
                    console.log('handle post')
                    console.log(req.params);
                    if( req.params && req.params.startDate !== null && req.params.endDate !== null ){
                        let startDate = new Date(req.params.startDate);
                        let endDate = new Date(req.params.endDate);
                        endDate.setDate(endDate.getDate() + 1);
                        nCinoXML.buildFromFolder(startDate,endDate,req.params.errorChecked).then((nCinoObject) => {

                            _.get(this).latestData = nCinoObject;
                            console.log('nCinoObject:',nCinoObject)
                            res.end(OutputBuilder.returnHTMLTable(nCinoObject,req.params.fieldList.split(',')));
                        })
                    }
                    else res.end("none");
                });
                _.get(this).router.post('/getFile/:fieldList',(req,res) =>{
                    console.log('req:',req.params.fieldList)
                    res.end(OutputBuilder.returnCSV(_.get(this).latestData,req.params.fieldList.split(',')))
                })
                _.get(this).app.listen(3000,() => {
                    console.log("Started on PORT 3000");
                })
            }catch(err){ errTracer(CLASSNAME,'setupRoutes',err); }
        }
    }
    return ServerController;
})();
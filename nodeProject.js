const xml2js = require('xml2js');
const fs = require('fs');
const nodemailer = require("nodemailer");
const http = require('http');
const express = require('express');
const bodyParser = require("body-parser");
const parser = new xml2js.Parser();

const fileLocation = '\\\\mwavsynergy\\synergy\\nCino\\{SYNAUTOIMP}\\ERROR\\';
const router = express.Router();
const path = require('path');
const app = express();

function parseXMLFile(xmlPath){
    let xmlObject = {};
    let xmlString = fs.readFileSync(xmlPath);
    parser.parseString(xmlString, function (err, result) {

        //console.log(result.FilingJob.Batch,'len:',result.FilingJob.Batch.length);
        if( result.FilingJob.Batch ){
            for( let j = 0; j < result.FilingJob.Batch.length; j++ ){
                let bat = result.FilingJob.Batch[j];
                let docs = bat.Document;
                for( let k = 0; k < docs.length; k++ ){
                    let doc = docs[k];
                    let indexes = doc.Indexes;
                    let pages = doc.Pages;
                    xmlObject.DocName = doc.DocName[0];

                    //read location and ID
                    for( let l=0; l < pages.length; l ++ ){
                        let page = pages[l].Page;
                        page = page[0]['_'];
                        xmlObject.DocLocation = page;
                        xmlObject.DocID = page.substring(page.lastIndexOf("\\")+1,page.indexOf('.'));
                    }
                    //read document info
                    for( let l=0; l < indexes.length; l ++ ){
                        let idx = indexes[l];
                        if( idx.Index ){
                            idx = idx.Index;
                            for( let m = 0; m < idx.length; m++ ){
                                let obj = idx[m];
                                xmlObject[obj['$'].Name] = obj['_']
                            }
                        }
                    }
                    //xmlObject.outputString += DocID + ", " + xmlObject.NAME + ", " + xmlObject.DocName + "\n";
                    //console.log()
                }
            }
        }
        else console.error('error parsing XML')
    });
    return xmlObject
}
function readXMLs(startDate,endDate=Date.now()){
    let resultObject = { outputString : '' };
    try{
        console.log('readXMLs:',fileLocation)
        let folders = fs.readdirSync(fileLocation,{withFileTypes :true})//,(err,files) => {
            folders.sort(function(a, b) {
                return fs.statSync(fileLocation + b.name).mtime.getTime() - 
                fs.statSync(fileLocation + a.name).mtime.getTime();
            });
            for( let i=0; i < folders.length; i++ ){
                let folder = folders[i];
                let curLocation = fileLocation + '\\'+folder.name
                let directoryStats = fs.statSync(curLocation);
                if( directoryStats.mtime.getTime() < startDate )
                break;
                if( directoryStats.isDirectory() ){
                    //console.log(folder.name);
                    let folderContents = fs.readdirSync(curLocation); 
                    folderContents.forEach(ent => {
                        if( ent.endsWith('.xml') ){
                            let xmlObject = parseXMLFile(curLocation+'\\'+ent);
                            resultObject[xmlObject.DocID] = xmlObject;
                            //resultObject.outputString += xmlObject.DocID + ", " + xmlObject.NAME + ", " + xmlObject.DocName + "\n";
                        }
                    })
                }
            }
    }catch(err){ console.error(err); }
    return resultObject;
};
function buildOutputString(xmlObject,delim="\n"){
    let outputString = "";
    for( let key in xmlObject )
        outputString += xmlObject[key].DocID + ", " + xmlObject[key].NAME + ", " + xmlObject[key].DocName + delim;
    return outputString;
}
function saveLogFile(xmlObject){
    try{
        let outputString = buildOutputString(xmlObject);
        let logFile = __dirname + "\\output\\" + Date.now() + '.txt';
        fs.writeFileSync(logFile,outputString)
        console.log('saved log file:',logFile)
    } catch(err){ console.error(err); }
}
function sendEmail(msg){
    try{
        let transporter = nodemailer.createTransport({
            host:"email.marinecu.com",
            port: 25
        });
        transporter.sendMail({
            from: '"nCino Synergy Monitor" <info@marinecu.com>', // sender address
            to: "casey.nitz@marinecu.com", // list of receivers
            subject: "Synergy Error Report", // Subject line
            html: "<h3>Errors occurred on the nCino Synergy AutoImport process for the following records:</h3>" + msg.replace('\n','<br/>'), // plain text body
        }).then((res) => {
            if( res && res.accepted.length )
                console.log('Accepted:',res.accepted)
            if( res && res.rejected.length )
                console.log('Rejected:',res.rejected)
        }).catch((err) => console.error(err));
    }catch(err){console.error(err)}
}


let watchLocation = fileLocation;
let newObjects = [];
fs.watch(watchLocation,(eventType,filename) => {
    if (filename) {
      console.log(`filename provided: ${filename},`,eventType);
      newObjects.push(filename)
    }
});
function clearObjects(){
    try{
        //console.log('new objects:',new Set(newObjects));
        let objectSet = new Set(newObjects);
        newObjects = [];
        let xmlObject = {};
        objectSet.forEach((newFolder) => {
            let curLocation = fileLocation + newFolder;
            let fileInfo = fs.statSync(curLocation);
            //console.log(fileInfo.isDirectory());
            if( fileInfo.isDirectory() ){
                let fileList = fs.readdirSync(curLocation);
                //console.log('new fileList:',fileList)
                fileList.forEach((newFile) => {
                    console.log(curLocation+"\\"+newFile)
                    let newResults = parseXMLFile(curLocation+"\\"+newFile);
                    xmlObject[newResults.DocID] = newResults;
                    //console.log(newResults);
                })
            }
        })
        console.log(buildOutputString(xmlObject));
        if( Object.keys(xmlObject).length )
            sendEmail(buildOutputString(xmlObject));
    }catch(err){ console.error(err); }
}

function startServer(){
    app.use("/", router);
    //app.use(express.json());
    //app.use(express.static("express"));
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    // default URL for website
    router.get('/',(req,res) => {
        res.sendFile(path.join(__dirname+'/index.html'));
        //code to perform particular action.
        //To access GET variable use req.query() and req.params() methods.
    });

    //Here we are configuring express to use body-parser as middle-ware.

    router.post('/handle/:range',(req,res) => {
        //code to perform particular action.
        //To access POST variable use req.body()methods.
        console.log('handle post')
        console.log(req.params);
        if( req.params && req.params.dateRange !== null ){
            console.log('ah')
            let xmlObject = readXMLs(new Date('January 10, 2022 00:00:00'))
            res.end(buildOutputString(xmlObject,"<br/>"));
        }
        else res.end("none");
    });
    app.listen(3000,() => {
        console.log("Started on PORT 3000");
    })
}

setInterval(clearObjects,30 * 60 * 1000);
startServer();
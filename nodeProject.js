const xml2js = require('xml2js');
const fs = require('fs');
const nodemailer = require("nodemailer");
const http = require('http');
const express = require('express');
const bodyParser = require("body-parser");
const parser = new xml2js.Parser();

const basePath = '\\\\mwavsynergy\\synergy\\nCino\\{SYNAUTOIMP}';
const successPath = basePath + "\\BACKUP\\";
const errorPath = basePath + "\\ERROR\\";
const router = express.Router();
const path = require('path');
const app = express();
function fileLocation(searchErrors){
    if( searchErrors && searchErrors !== "false" )
        return errorPath;
    return successPath;
}
var latestData;

function parseXMLFile(xmlPath){
    let xmlObject = {};
    try{
        let xmlString = fs.readFileSync(xmlPath);
        parser.parseString(xmlString, function (err, result) {
            //console.log(result.FilingJob.Batch,'len:',result.FilingJob.Batch.length);
            if( result && result.FilingJob && result.FilingJob.Batch ){
                for( let j = 0; j < result.FilingJob.Batch.length; j++ ){
                    let bat = result.FilingJob.Batch[j];
                    let docs = bat.Document;
                    for( let k = 0; k < docs.length; k++ ){
                        let doc = docs[k];
                        let indexes = doc.Indexes;
                        let pages = doc.Pages;
                        xmlObject.DocName = doc.DocName[0];
                        xmlObject.Cabinet = doc.Cabinet[0];
                        xmlObject.Institution = doc.Institution[0];
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
    }catch(err){console.error(err)}

    return xmlObject
}
function readXMLs(startDate,endDate=Date.now(),searchErrors){
    let resultObject = { outputString : '' };
    try{
        console.log('readXMLs:',fileLocation(searchErrors))
        let folders = fs.readdirSync(fileLocation(searchErrors),{withFileTypes :true})//,(err,files) => {
           // console.log('folders?',folders.length)
            folders.sort(function(a, b) {
                return fs.statSync(fileLocation(searchErrors) + b.name).mtime.getTime() - 
                fs.statSync(fileLocation(searchErrors) + a.name).mtime.getTime();
            });
            for( let i=0; i < folders.length; i++ ){
                let folder = folders[i];
                let curLocation = fileLocation(searchErrors) + '\\'+folder.name
                let directoryStats = fs.statSync(curLocation);
                //console.log('mTime:',directoryStats.mtime.getTime(),'startDate:',startDate,' lessthan? ',directoryStats.mtime.getTime() < startDate);
                //console.log('mTime:',directoryStats.mtime.getTime(),'endDate:',endDate,'greaterthan?',directoryStats.mtime.getTime() > endDate);
                //console.log('curLocation:',curLocation)
                if( directoryStats.mtime.getTime() <= startDate )
                    break;
                else if ( directoryStats.mtime.getTime() >= endDate )
                    continue;
                if( directoryStats.isDirectory() ){
                    //console.log(folder.name);
                    let folderContents = fs.readdirSync(curLocation);
                    folderContents.forEach(ent => {
                        //console.log('ent:',ent);
                        if( ent.endsWith('.xml') ){
                            let xmlObject = parseXMLFile(curLocation+'\\'+ent);
                            let fileStats = fs.statSync(curLocation+'\\'+ent);
                            xmlObject.synFileDate = new Date(fileStats.mtime.getTime());
                            resultObject[xmlObject.DocID] = xmlObject;
                            //resultObject.outputString += xmlObject.DocID + ", " + xmlObject.NAME + ", " + xmlObject.DocName + "\n";
                        }
                    })
                }
            }
    }catch(err){ console.error(err); }
    return resultObject;
};
function buildOutputTable(xmlObject,delim="\n",fieldList){
    let outputString = "<table> <tr>"
    fieldList.forEach((field) =>{
        outputString += "<th>" + field + "</th>";
    })
    outputString += "</tr>"
    "<th>Document ID</th> <th>Name</th> <th>Document Name</th> <th>Institution</th> </tr>";
    console.log('fieldList:')
    console.log(fieldList)
    for( let key in xmlObject ){
        if( key !== 'outputString' ){
            outputString += "<tr>"
            fieldList.forEach((field) => {
                outputString += "<td>" + xmlObject[key][field] + "</td>"
            })
            outputString += "</tr>"
            // outputString += "<tr>";
            // outputString += "<td>"+xmlObject[key].DocID + "</td><td>" + xmlObject[key].NAME + "</td><td>" + xmlObject[key].DocName + "</td><td>" + xmlObject[key].Institution + "</td>";
            // outputString += "</tr>";
        }
    }
    outputString += "</table>";
    return outputString;
}
function buildOutputCSV(xmlObject,delim="\n",fieldList){
    let outputString = fieldList + delim;
    fieldList = fieldList.split(',');
    for( let key in xmlObject ){
        if( key !== 'outputString' ){
            let obj = xmlObject[key];
            fieldList.forEach((field,i) => {
                let curValue = obj[field];
                if( i !== 0 ) outputString +=',';
                if( typeof curValue == "string" )
                    outputString += obj[field].replaceAll(',',' ')
                else if( field == 'synFileDate' ){
                    curValue = new Date(curValue);
                    outputString += curValue.toDateString();
                }
                    
            })
            if( fieldList.length !== 0 )
                outputString+='\n';
            //outputString += xmlObject[key].DocID + ", " + xmlObject[0.].NAME + ", " + xmlObject[key].DocName + delim;
        }
    }
    return outputString;
}
function saveLogFile(xmlObject){
    try{
        let outputString = buildOutputCSV(xmlObject);
        let logFile = __dirname + "\\output\\" + Date.now() + '.txt';
        fs.writeFileSync(logFile,outputString)
        console.log('saved log fileLocation + suffix;:',logFile)
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
            cc: "heidi.dearman@marinecu.com",
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


let watchLocation = fileLocation(true);
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
            let curLocation = fileLocation(true) + newFolder;
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
        if( Object.keys(xmlObject).length )
            sendEmail(buildOutputCSV(xmlObject));
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
    router.post('/getTable/:startDate/:endDate/:errorChecked/:fieldList',(req,res) => {
        //code to perform particular action.
        //To access POST variable use req.body()methods.
        console.log('handle post')
        console.log(req.params);
        if( req.params && req.params.startDate !== null && req.params.endDate !== null ){
            let endDate = new Date(req.params.endDate);
            endDate.setDate(endDate.getDate() + 1);
            let xmlObject = readXMLs(new Date(req.params.startDate),endDate,req.params.errorChecked);
            latestData = xmlObject;
            res.end(buildOutputTable(xmlObject,"<br/>",req.params.fieldList.split(',')));
        }
        else res.end("none");
    });
    router.post('/getFile/:fieldList',(req,res) =>{
        res.end(buildOutputCSV(latestData,"\n",req.params.fieldList))
    })
    app.listen(3000,() => {
        console.log("Started on PORT 3000");
    })
}

setInterval(clearObjects,30000);
startServer();
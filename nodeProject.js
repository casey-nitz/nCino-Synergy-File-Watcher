const ServerController = require('./classes/serverctl');
const EmailController = require('./classes/emailctl');
const nCinoXMl = require('./classes/ncinoxml');
const OutputBuilder = require('./classes/outputbuilder');
const TimedFileQueueController = require('./classes/timedfilequeuectl');
const errorLoc = '\\\\mwavsynergy\\synergy\\nCino\\{SYNAUTOIMP}\\ERROR';//'C:\\Users\\cnitz\\Documents\\workspace\\nCino-Synergy-File-Watcher\\scratch\\ERROR';
const successLoc = '\\\\mwavsynergy\\synergy\\nCino\\{SYNAUTOIMP}\\BACKUP';//'C:\\Users\\cnitz\\Documents\\workspace\\nCino-Syner+gy-File-Watcher\\scratch\\SUCCESS';
const emailRecipients = "casey.nitz@marinecu.com, heidi.dearman@marinecu.com";
const path = require('path')

//Setup Server
let sctl = new ServerController();
sctl.setupServer();

//Setup watcher on ERROR folder. Send an email every time an error occurs (only sends one email per 15 min, max)
let errorFileQueue = new TimedFileQueueController( [errorLoc], 1000 * 60 * 15  )
errorFileQueue.on('files',(d) => {
    console.log('errorFileQueue files:',d);
    let objList = [];
    if( d && d[errorLoc].length !== 0 ){
        console.log('Error messages received. Sending email');
        for( let i = 0; i < d[errorLoc].length; i++ ){
            let f = d[errorLoc][i]
            objList.push( nCinoXMl.buildFromXMLFile(path.join(errorLoc, f)) );
        }
        //.log('objList:',objList);
        let msg = OutputBuilder.returnHTMLTable( objList, ['DocID','DocName',"Name","SynergyFileDate"] );
        //console.log('msg:',msg);
        EmailController.SendEmail( emailRecipients, "Synergy Warning: Error Received","<h3>Errors occurred on the nCino Synergy AutoImport process for the following records:</h3><br/>" + msg)
    }
});

//File watcher on both BACKUP and ERROR folders. Trips every 24 hours, sending an error email if no files have been received within that period
let doubleFileQueue = new TimedFileQueueController( [errorLoc,successLoc], 1000 * 60 * 60 * 24 );
doubleFileQueue.on('files',(d) => {
    if( d && d[errorLoc].length == 0 && d[successLoc].length == 0 ){
        console.log('No files came in within the given timeframe. Sending error email');
        EmailController.SendEmail( emailRecipients, "Synergy Warning: No Files received","No files (ERROR or BACKUP) have been received by the nCino Synergy Queue within the past 24 hours.");
    } 
})
const { is, errTracer } = require('./utilities');
const CLASSNAME = 'nCinoXML';
const FilingJobInfo = require('./filingjobinfo');
const FIELDS = ["BatchName","DocName","DocLocation","DocID","DocDate","Institution","Cabinet","Type","AcctNo","TaxID","Name","SynergyFileDate"];
const fs = require('fs');

const basePath = '\\\\mwavsynergy\\synergy\\nCino\\{SYNAUTOIMP}';
const successPath = basePath + "\\BACKUP\\";
const errorPath = basePath + "\\ERROR\\";

module.exports = (() => {
    let _ = new WeakMap();
    class nCinoXML {
        /**
         * Internal method for retrieving the standard folder locations
         * @param {String} searchErrors If true (or "true"), returns BACKUP folder, otherwise returns ERROR folder
         * @returns {String} 
         */
        static fileLocation(searchErrors){
            if( searchErrors && searchErrors !== "false" )
                return errorPath;
            return successPath;
        }
        /**
         * Build nCinoXML objects from standard Synergy folder
         * @param {Date} startDate Earliest date to search 
         * @param {Date} endDate Latest date to search
         * @param {Boolean} searchErrors true = search ERROR folder, false = search BACKUP folder
         * @async
         * @returns {nCinoXML[]} 
         */
        static buildFromFolder( startDate, endDate, searchErrors ){
            return new Promise((resolve,reject) => {
                try{
                    let folders = fs.readdirSync(this.fileLocation(searchErrors),{withFileTypes :true});
                    let folderStats = {};
                    let readerQueue = [];
                    let resultList = [];
                    folders.forEach((f) => {
                        readerQueue.push( new Promise((res,rej) => {
                            //console.log('pushing:')
                            let fileLoc = this.fileLocation(searchErrors)+'\\'+ f.name
                            fs.stat(fileLoc,(err,stats)=>{
                                if( err ){
                                    rej(errTracer(CLASSNAME,`fs.stat(${f.name})`,err));
                                }else{
                                    folderStats[f.name] = stats;
                                    //console.log('resolving')
                                    res();
                                }
                            })
                        }) );
                    })
                    //console.log('waiting for promises:',readerQueue.length);
                    Promise.all(readerQueue).then(() => {
                        let readerQueue2 = [];
                        //console.log('done reading');
                        folders.sort((a,b) => {
                            return folderStats[b.name].mtime.getTime() - folderStats[a.name].mtime.getTime()
                        })
                        for( let i = 0; i < folders.length; i++ ){
                            let folder = folders[i];
                            let curLocation = this.fileLocation(searchErrors)+'\\'+folder.name;
                            let curStats = folderStats[folder.name];
                            if( curStats.mtime.getTime() <= startDate )
                                break;
                            else if( curStats.mtime.getTime() >= endDate )
                                continue;
                            else if( curStats.isDirectory() ){
                                readerQueue2.push( new Promise((res,rej) => {
                                    fs.readdir(curLocation,(err,stats) => {
                                        if( err ) rej(err);
                                        else{
                                            //console.log('stats:',stats)
                                            stats.forEach((ent) => {
                                                if( ent.endsWith('.xml') ){
                                                    let obj = this.buildFromXMLFile(curLocation+'\\'+ent);
                                                    fs.stat(curLocation+'\\'+ent,(e,s) => {
                                                        if( e ) rej(e);
                                                        else{
                                                            obj.SynergyFileDate = s.mtime.getTime();
                                                            resultList.push(obj);
                                                            res();
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                    })
                                }))
                            }
                        }
                        //console.log('waiting pt 2:',readerQueue2.length);
                        return Promise.all(readerQueue2).then(() => resolve(resultList)).catch((err) => rej(errTracer(CLASSNAME,'buildFromFolder',err)))
                    }).catch((err) => reject(errTracer(CLASSNAME,'buildFromFolder',err)));
                }catch(err){ reject(errTracer(CLASSNAME,'buildFromFolder',err)); }
            })
        }
        /**
         * Build nCinoXML object from file location
         * @param {String} xmlPath Path to XML file to parse into nCinoXML object
         * @returns {nCinoXML}
         */
        static buildFromXMLFile( xmlPath ){
            try{
                let fj = FilingJobInfo.buildFromXMLFile( xmlPath );
                let nCinoObj = {
                    FilingJob : fj,
                    DocLocation : fj.FileLocation,
                    DocID : fj.DocID
                };
                if( Object.values(fj.Batches).length !== 1 )
                    throw new Error('Invalid nCino XML structure: batch count');
                let batch = Object.values(fj.Batches)[0];
                nCinoObj.BatchName = batch.BatchName;
                if( Object.values(batch.Documents).length !== 1 )
                    throw new Error('Invalid nCino XML structure: document count');
                let doc = Object.values(batch.Documents)[0];
                nCinoObj.DocName = doc.DocName;
                nCinoObj.Cabinet = doc.Cabinet;
                nCinoObj.Type = doc.Type;
                nCinoObj.Institution = doc.Institution;
                for( let i=0; i < doc.Indexes.length; i++ ){
                    let curIndex = doc.Indexes[i];
                    switch( curIndex.Name.toLowerCase() ){
                        case 'name' :
                            nCinoObj.Name = curIndex.Value;
                        case 'tax id' : 
                            nCinoObj.TaxID = curIndex.Value;
                        case 'acct no' :
                            nCinoObj.AcctNo = curIndex.Value;
                        case 'doc date' :
                            nCinoObj.DocDate = curIndex.Value;
                        default: continue;
                    }
                }
                let stat = fs.statSync(xmlPath);
                if( stat )
                    nCinoObj.SynergyFileDate = stat.mtime.getTime();
                return new nCinoXML( nCinoObj );
            }catch(err){ errTracer(CLASSNAME,'buildFromXMLFile',err); }
        }
        /**
         * Fields expected to be defined in every nCino-related Synergy XML file
         * @returns {String[]}
         */
        static getFieldList(){ return FIELDS; }

        /**
         * nCinoXML constructor
         * @param {Object} obj JSON object defining fields, should be parsed from XML file
         * @param {String} [obj.BatchName]
         * @param {String} [obj.DocName]
         * @param {String} [obj.DocLocation]
         * @param {String} [obj.DocID]
         * @param {String} [obj.DocDate]
         * @param {String} [obj.Institution]
         * @param {String} [obj.Cabinet]
         * @param {String} [obj.Type]
         * @param {String} [obj.AcctNo]
         * @param {String} [obj.TaxID]
         * @param {String} [obj.Name]
         * @param {Number} [obj.SynergyFileDate] Number representing a UTC date, when the file was loaded into the file location
         */
        constructor( obj ){
            try{
                let constructorObj = {};
                FIELDS.forEach((field) => {
                    if( obj[field] !== null && obj[field] !== undefined )
                        constructorObj[field] = is(obj[field],field =="SynergyFileDate" ? 'number' : 'string',field)
                });
                if( obj.FilingJob )
                    constructorObj.FilingJob = obj.FilingJob;
                _.set(this,constructorObj);
            }catch(err){ errTracer(CLASSNAME,'constructor',err); }
        }
        /**
         * FilingJob getter/setter
         * @returns {String}
         */
        get FilingJob(){ return _.get(this).FilingJob; }
        set FilingJob( which ){
            try{
                _.get(this).FilingJob = is(which,'string','FilingJob')
            }catch(err){ errTracer(CLASSNAME,'setFilingJob',err); }
        }
        /**
         * BatchName getter/setter
         * @returns {String}
         */
        get BatchName(){ return _.get(this).BatchName; }
        set BatchName( which ){
            try{
                _.get(this).BatchName = is(which,'string','BatchName');
            }catch(err){ errTracer(CLASSNAME,'setBatchName',err); }
        }
        /**
         * DocName getter/setter
         * @returns {String}
         */
        get DocName(){ return _.get(this).DocName; }
        set DocName(which){
            try{
                _.get(this).DocName = is(which,'string','DocName');
            }catch(err){ errTracer(CLASSNAME,'setDocName',err); }
        }
        /**
         * DocLocation getter/setter
         * @returns {String}
         */
        get DocLocation(){ return _.get(this).DocLocation; }
        set DocLocation(which){
            try{
                _.get(this).DocLocation = is(which,'string','DocLocation');
            }catch(err){ errTracer(CLASSNAME,'setDocLocation',err); }
        }
        /**
         * DocID getter/setter
         * @returns {String}
         */
        get DocID(){ return _.get(this).DocID; }
        set DocID(which){
            try{
                _.get(this).DocID = is(which,'string','DocID');
            }catch(err){ errTracer(CLASSNAME,'setDocID',err); }
        }
        /**
         * DocDate getter/setter
         * @returns {String}
         */
        get DocDate(){ return _.get(this).DocDate; }
        set DocDate(which){
            try{
                _.get(this).DocDate = is(which,'string','DocDate');
            }catch(err){ errTracer(CLASSNAME,'setDocDate',err); }
        }
        /**
         * Institution getter/setter
         * @returns {String}
         */
        get Institution(){ return _.get(this).Institution; }
        set Institution(which){
            try{
                _.get(this).Institution = is(which,'string','Institution');
            }catch(err){ errTracer(CLASSNAME,'setInstitution',err); }
        }
        /**
         * Cabinet getter/setter
         * @returns {String}
         */
        get Cabinet(){ return _.get(this).Cabinet; }
        set Cabinet(which){
            try{
                _.get(this).Cabinet = is(which,'string','Cabinet');
            }catch(err){ errTracer(CLASSNAME,'setCabinet',err); }
        }
        /**
         * Type getter/setter
         * @returns {String}
         */
        get Type(){ return _.get(this).Type; }
        set Type(which){
            try{
                _.get(this).Type = is(which,'string','Type');
            }catch(err){ errTracer(CLASSNAME,'setType',err); }
        } 
        /**
         * AcctNo getter/setter
         * @returns {String}
         */
        get AcctNo(){ return _.get(this).AcctNo; }
        set AcctNo(which){
            try{
                _.get(this).AcctNo = is(which,'string','AcctNo');
            }catch(err){ errTracer(CLASSNAME,'setAcctNo',err); }
        }
        /**
         * TaxID getter/setter
         * @returns {String}
         */
        get TaxID(){ return _.get(this).TaxID; }
        set TaxID(which){
            try{
                _.get(this).TaxID = is(which,'string','TaxID');
            }catch(err){ errTracer(CLASSNAME,'setTaxID',err); }
        }
        /**
         * Name getter/setter
         * @returns {String}
         */
        get Name(){ return _.get(this).Name; }
        set Name( which ){
            try{
                _.get(this).Name = is(which,'string','Name')
            }catch(err){ errTracer(CLASSNAME,'setName',err) }
        }
        /**
         * SynergyFileDate getter/setter. Number corresponding to a UTC value in milliseconds, representing the date the file was uploaded to the Synergy file location
         * @returns {Number}
         */
        get SynergyFileDate(){ return _.get(this).SynergyFileDate; }
        set SynergyFileDate(which){
            try{
                _.get(this).SynergyFileDate = is(which,'number','SynergyFileDate');
            }catch(err){ errTracer(CLASSNAME,'setSynergyFileDate',err); }
        }
    }
    return nCinoXML;
})();
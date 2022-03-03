const { is, errTracer } = require('./utilities');
const CLASSNAME = 'nCinoXML';
const FilingJobInfo = require('./filingjobinfo');
const FIELDS = ["BatchName","DocName","Cabinet","Institution","DocLocation","DocID","DocName","DocDate","Institution","Cabinet","Type","AcctNo","TaxID","Name","SynergyFileDate"];

module.exports = (() => {
    let _ = new Map();
    class nCinoXML {
        static getFieldList(){ return FIELDS; }
        static parseFromXMLFile( xmlPath ){
            try{
                let fj = FilingJobInfo.parseFromXMLFile( xmlPath );
                let nCinoObj = {
                    FilingJob : fj,
                    DocLocation : fj.FileLocation
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
                return new nCinoXML( nCinoObj );
            }catch(err){ errTracer(CLASSNAME,'parseFromXMLFile',err); }
        }

        constructor( obj ){
            try{
                let constructorObj = {};
                FIELDS.forEach((field) => {
                    if( obj[field] !== null && obj[field] !== undefined )
                        constructorObj[field] = is(obj[field],'string',field)
                });
                if( obj.FilingJob )
                    constructorObj.FilingJob = obj.FilingJob;
                _.set(this,constructorObj);
            }catch(err){ errTracer(CLASSNAME,'constructor',err); }
        }
        get FilingJob(){ return _.get(this).FilingJob; }
        set FilingJob( which ){
            try{
                _.get(this).FilingJob = is(which,'string','FilingJob')
            }catch(err){ errTracer(CLASSNAME,'setFilingJob',err); }
        }
        get BatchName(){ return _.get(this).BatchName; }
        set BatchName( which ){
            try{
                _.get(this).BatchName = is(which,'string','BatchName');
            }catch(err){ errTracer(CLASSNAME,'setBatchName',err); }
        }
        get DocName(){ return _.get(this).DocName; }
        set DocName(which){
            try{
                _.get(this).DocName = is(which,'string','DocName');
            }catch(err){ errTracer(CLASSNAME,'setDocName',err); }
        }
        get DocLocation(){ return _.get(this).DocLocation; }
        set DocLocation(which){
            try{
                _.get(this).DocLocation = is(which,'string','DocLocation');
            }catch(err){ errTracer(CLASSNAME,'setDocLocation',err); }
        }
        get DocID(){ return _.get(this).DocID; }
        set DocID(which){
            try{
                _.get(this).DocID = is(which,'string','DocID');
            }catch(err){ errTracer(CLASSNAME,'setDocID',err); }
        }
        get DocDate(){ return _.get(this).DocDate; }
        set DocDate(which){
            try{
                _.get(this).DocDate = is(which,'string','DocDate');
            }catch(err){ errTracer(CLASSNAME,'setDocDate',err); }
        }
        get Institution(){ return _.get(this).Institution; }
        set Institution(which){
            try{
                _.get(this).Institution = is(which,'string','Institution');
            }catch(err){ errTracer(CLASSNAME,'setInstitutione',err); }
        }
        get Cabinet(){ return _.get(this).Cabinet; }
        set Cabinet(which){
            try{
                _.get(this).Cabinet = is(which,'string','Cabinet');
            }catch(err){ errTracer(CLASSNAME,'setCabinet',err); }
        }
        get Type(){ return _.get(this).Type; }
        set Type(which){
            try{
                _.get(this).Type = is(which,'string','Type');
            }catch(err){ errTracer(CLASSNAME,'setType',err); }
        } 
        get AcctNo(){ return _.get(this).AcctNo; }
        set AcctNo(which){
            try{
                _.get(this).AcctNo = is(which,'string','AcctNo');
            }catch(err){ errTracer(CLASSNAME,'setAcctNo',err); }
        }
        get TaxID(){ return _.get(this).TaxID; }
        set TaxID(which){
            try{
                _.get(this).TaxID = is(which,'string','TaxID');
            }catch(err){ errTracer(CLASSNAME,'setTaxID',err); }
        }
        get Name(){ return _.get(this).Name; }
        set Name( which ){
            try{
                _.get(this).Name = is(which,'string','Name')
            }catch(err){ errTracer(CLASSNAME,'setName',err) }
        }
        get SynergyFileDate(){ return _.get(this).SynergyFileDate; }
        set SynergyFileDate(which){
            try{
                _.get(this).SynergyFileDate = is(which,'string','SynergyFileDate');
            }catch(err){ errTracer(CLASSNAME,'setSynergyFileDate',err); }
        }
    }
    return nCinoXML;
})();
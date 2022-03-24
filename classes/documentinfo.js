const { is, errTracer } = require('./utilities');
const CLASSNAME = 'DocumentInfo';
const xml2js = require('xml2js');
const IndexInfo = require('./indexinfo');
const parser = new xml2js.Parser();

module.exports = (() => {
    let _ = new WeakMap();
    /**
     * Class representing the "Document" portion of a Synergy XML file
     */
    class DocumentInfo {
        static mkFromParsedXML( obj ){
            try{
                let constructorObj = {
                    SeqNum : obj['$'].SeqNum,
                    DocName : obj.DocName[0],
                    Type : obj.Type[0],
                    Institution : obj.Institution[0],
                    Cabinet : obj.Cabinet[0]
                };
                let docObject = new DocumentInfo(constructorObj);
                if( obj.Indexes ){
                    let arr = obj.Indexes[0].Index;
                    for( let i=0; i < arr.length; i++ ){
                        if( arr[i]['_'] && arr[i]['$'] && arr[i]['$'].Name )
                            docObject.addIndex(arr[i]['$'].Name,arr[i]['_'])
                    }
                }

                return docObject;
            }catch(err){ errTracer( CLASSNAME,"mkFromParsedXML",err) }
        }
        /**
         * Object representing the "Document" portion of a Synergy XML
         * @param {Object} obj JSON object containing parameters used to construct
         * @param {String} [obj.DocName] Document name, corresponds to field in Synergy XML
         * @param {String} [obj.Cabinet] Cabinet that document is filed in
         * @param {String} [obj.Institution] Institution that document is filed in
         * @param {String} [obj.DocLocation] Document location within the file system
         * @param {String} [obj.Type] Type this document is filed under
         * @param {String} [obj.SeqNum] Sequence Number, internal field used by Synergy
         */
        constructor( obj ){
            try{
                let constructorObj = {
                    Indexes : [],
                    Pages : []
                };
                ["DocName","Cabinet","Institution","DocLocation","Type","SeqNum"].forEach((val) => {
                    if( obj[val] ){
                        constructorObj[val] = is(obj[val],"string",val);
                    }
                });
                _.set(this,constructorObj);
            }catch(err){ errTracer(CLASSNAME,"constructor",err); }
        }
        /** 
         * Simple SeqNum getter/setter 
         * @returns {String}
         */
        get SeqNum(){ return _.get(this).SeqNum; }
        set SeqNum(which){
            try{
                _.get(this).SeqNum = is(which,"string","SeqNum")
            }catch(err){ errTracer(CLASSNAME,'setSeqNum',err); }
        }
        /** 
         * Simple DocName getter/setter 
         * @returns {String}
        */
        get DocName(){ return _.get(this).DocName }
        set DocName(which){
            try{
                _.get(this).DocName = is(which,"string","DocName")
            }catch(err){ errTracer(CLASSNAME,'setDocName',err); }
        }
        /** 
         * Simple Cabinet getter/setter 
         * @returns {String}
         */
        get Cabinet(){ return _.get(this).Cabinet }
        set Cabinet(which){
            try{
                _.get(this).Cabinet = is(which,"string","Cabinet")
            }catch(err){ errTracer(CLASSNAME,'setCabinet',err); }
        }
        /** 
         * Simple Type getter/setter 
         * @returns {String}
         */
        get Type(){ return _.get(this).Type }
        set Type(which){
            try{
                _.get(this).Type = is(which,"string","Type")
            }catch(err){ errTracer(CLASSNAME,'setType',err); }
        }
        /** 
         * Simple Institution getter/setter 
         * @returns {String}
         */
        get Institution(){ return _.get(this).Institution }
        set Institution(which){
            try{
                _.get(this).Institution = is(which,"string","Institution")
            }catch(err){ errTracer(CLASSNAME,'setInstitution',err); }
        }
        /** 
         * Simple getter for Indexes 
         * @returns {IndexInfo[]} Array of IndexInfo
        */
        get Indexes(){ return _.get(this).Indexes }
        /**
         * Creates new IndexInfo object and adds it
         * @param {String} name Index Name
         * @param {String} value Index Value
         */
        addIndex( name, value ){
            try{
                _.get(this).Indexes.push( new IndexInfo(  is(name,"string","indexname"), is(value,"string","indexvalue")));
            }catch(err){ errTracer(CLASSNAME,'addIndex',err); }
        }
    }
    return DocumentInfo;
})();
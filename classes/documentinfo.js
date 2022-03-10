const { is, errTracer } = require('./utilities');
const CLASSNAME = 'DocumentInfo';
const xml2js = require('xml2js');
const IndexInfo = require('./indexinfo');
const parser = new xml2js.Parser();

module.exports = (() => {
    let _ = new WeakMap();
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
         * 
         * @param {*} obj 
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
        get SeqNum(){ return _.get(this).SeqNum; }
        set SeqNum(which){
            try{
                _.get(this).SeqNum = is(which,"string","SeqNum")
            }catch(err){ errTracer(CLASSNAME,'setSeqNum',err); }
        }
        get DocName(){ return _.get(this).DocName }
        set DocName(which){
            try{
                _.get(this).DocName = is(which,"string","DocName")
            }catch(err){ errTracer(CLASSNAME,'setDocName',err); }
        }
        get Cabinet(){ return _.get(this).Cabinet }
        set Cabinet(which){
            try{
                _.get(this).Cabinet = is(which,"string","Cabinet")
            }catch(err){ errTracer(CLASSNAME,'setCabinet',err); }
        }
        get Type(){ return _.get(this).Type }
        set Type(which){
            try{
                _.get(this).Type = is(which,"string","Type")
            }catch(err){ errTracer(CLASSNAME,'setType',err); }
        }
        get Institution(){ return _.get(this).Institution }
        set Institution(which){
            try{
                _.get(this).Institution = is(which,"string","Institution")
            }catch(err){ errTracer(CLASSNAME,'setInstitution',err); }
        }
        get Indexes(){ return _.get(this).Indexes }
        addIndex( name, value ){
            try{
                _.get(this).Indexes.push( new IndexInfo(  is(name,"string","indexname"), is(value,"string","indexvalue")));
            }catch(err){ errTracer(CLASSNAME,'addIndex',err); }
        }
    }
    return DocumentInfo;
})();
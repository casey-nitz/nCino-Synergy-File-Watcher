const { is, errTracer } = require('./utilities');
const CLASSNAME = 'DocumentInfo';
const xml2js = require('xml2js');
const parser = new xml2js.Parser();

module.exports = (() => {
    let _ = new Map();
    class DocumentInfo {
        static mkFromParsedXML( obj ){
            try{
                console.log('make document:');
                console.log(obj);
                let constructorObj = {
                    SeqNum : obj['$'].SeqNum,
                    DocName : obj.DocName[0],
                    Type : obj.Type[0],
                    Institution : obj.Institution[0]
                };
                let docObject = new DocumentInfo(constructorObj);
                console.log(obj.Indexes)
                console.log(obj.Pages);
                if( obj.Indexes ){
                    let arr = obj.Indexes[0].Index;
                    for( let i=0; i < arr.length; i++ ){
                        console.log(arr[i]);
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
                    Indexes : {},
                    Pages : {}
                };
                ["DocName","Cabinet","Institution","DocLocation","Type"].forEach((val) => {
                    if( obj[val] ){
                        constructorObj[val] = is(obj[val],"string",val);
                        if( val == "DocLocation" )
                            constructorObj["DocID"] = obj[val].substring(obj[val].lastIndexOf("\\")+1,obj[val].indexOf('.'))
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
        get Cabinet(){ return _.get(this).DocName }
        set Cabinet(which){
            try{
                _.get(this).Cabinet = is(which,"string","Cabinet")
            }catch(err){ errTracer(CLASSNAME,'setCabinet',err); }
        }
        get Type(){ return _.get(this).DocName }
        set Type(which){
            try{
                _.get(this).Type = is(which,"string","Type")
            }catch(err){ errTracer(CLASSNAME,'setType',err); }
        }
        get Institution(){ return _.get(this).DocName }
        set Institution(which){
            try{
                _.get(this).Institution = is(which,"string","Institution")
            }catch(err){ errTracer(CLASSNAME,'setInstitution',err); }
        }

        get Indexes(){ return _.get(this).Indexes }
        addIndex( name, value ){
            try{
                _.get(this).Indexes[is(name,"string","indexname")] = is(value,"string","indexvalue");
            }catch(err){ errTracer(CLASSNAME,'addIndex',err); }
        }
        delIndex( name ){
            try{
                _.get(this).Indexes[is(name,"string","indexname")] = undefined;
            }catch(err){ errTracer(CLASSNAME,'delIndex',err); }
        }
    }
    return DocumentInfo;
})();
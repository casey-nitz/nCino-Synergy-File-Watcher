const { is, errTracer } = require('./utilities');
const CLASSNAME = 'BatchInfo';
const DocumentInfo = require('./documentinfo')

module.exports = (() => {
    let _ = new Map();
    class BatchInfo {
        static mkFromParsedXML( batchObj ){
            let constructorObject = {};
            if( batchObj['$'] && batchObj['$'].SeqNum )
                constructorObject.SeqNum = batchObj['$'].SeqNum;
            ['BatchName','FileRoom','DeleteFiles'].forEach((fld) => {
                if( batchObj[fld] && batchObj[fld].length == 1 )
                    constructorObject[fld] = batchObj[fld][0];
            });
            let batchInfo = new BatchInfo( constructorObject );
            if( batchObj.Document ){
                for( let i=0; i < batchObj.Document.length; i++ ){
                    batchInfo.addDocument( DocumentInfo.mkFromParsedXML(batchObj.Document[i]) );
                }
            }
            return batchInfo; 
        }
        constructor( obj ){
            try{
                let initObj = {
                    SeqNum : obj.SeqNum ? is(obj.SeqNum,"string",'SeqNum') : undefined,
                    BatchName : obj.BatchName ? is(obj.BatchName,"string",'BatchName') : undefined,
                    FileRoom : obj.FileRoom ? is(obj.FileRoom,"string",'FileRoom') : undefined,
                    DeleteFiles : obj.DeleteFiles ? is(obj.DeleteFiles,"string",'DeleteFiles') : undefined,
                    Documents : {}
                }
                _.set(this,initObj);
            }catch(err){ errTracer(CLASSNAME,"constructor",err); }
        }

        get SeqNum(){ return _.get(this).SeqNum; }
        set SeqNum( which ){
            try{
                _.get(this).SeqNum = is(which,"string","SeqNum")
            }catch(err){ errTracer(CLASSNAME,'setSeqNum',err); }
        }

        get BatchName(){ return _.get(this).BatchName; }
        set BatchName( which ){
            try{
                _.get(this).BatchName = is(which,"string","BatchName")
            }catch(err){ errTracer(CLASSNAME,'setBatchName',err); }
        }
        get FileRoom(){ return _.get(this).FileRoom; }
        set FileRoom( which ){
            try{
                _.get(this).FileRoom = is(which,"string","FileRoom")
            }catch(err){ errTracer(CLASSNAME,'setFileRoom',err); }
        }

        get DeleteFiles(){ return _.get(this).DeleteFiles; }
        set DeleteFiles( which ){
            try{
                _.get(this).DeleteFiles = is(which,"string","DeleteFiles")
            }catch(err){ errTracer(CLASSNAME,'setDeleteFiles',err); }
        }

        get Documents(){ return _.get(this).Documents; }
        addDocument( documentObj ){
            try{
                _.get(this).Documents[documentObj.SeqNum] = documentObj;
            }catch(err){ errTracer(CLASSNAME,'addDocument',err); }
        }
    }
    return BatchInfo;
})();
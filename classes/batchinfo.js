const { is, errTracer } = require('./utilities');
const CLASSNAME = 'BatchInfo';
const DocumentInfo = require('./documentinfo')

module.exports = (() => {
    let _ = new WeakMap();
    class BatchInfo {
        /**
         * Should only be called by FilingJobInfo.mkFromParsedXML
         * @param {Object} batchObj JSON object, passed in by FilingJobInfo, representing the Batch tag within a Synergy XML file
         * @returns {BatchInfo}
         */
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
        /**
         * BatchInfo constructor
         * @param {Object} obj Object describing fields in the Batch tag from a Synergy XML file. All fields optional and defined by the XML
         * @param {String} [obj.SeqNum]
         * @param {String} [obj.BatchName]
         * @param {String} [obj.FileRoom]
         * @param {String} [obj.DeleteFiles]
         */
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

        /**
         * Sequence Number getter/setter
         * @returns {String}
         */
        get SeqNum(){ return _.get(this).SeqNum; }
        set SeqNum( which ){
            try{
                _.get(this).SeqNum = is(which,"string","SeqNum")
            }catch(err){ errTracer(CLASSNAME,'setSeqNum',err); }
        }
        /**
         * BatchName getter/setter
         * @returns {String}
         */
        get BatchName(){ return _.get(this).BatchName; }
        set BatchName( which ){
            try{
                _.get(this).BatchName = is(which,"string","BatchName")
            }catch(err){ errTracer(CLASSNAME,'setBatchName',err); }
        }
        /**
         * FileRoom getter/setter
         * @returns {String}
         */
        get FileRoom(){ return _.get(this).FileRoom; }
        set FileRoom( which ){
            try{
                _.get(this).FileRoom = is(which,"string","FileRoom")
            }catch(err){ errTracer(CLASSNAME,'setFileRoom',err); }
        }
        /**
         * DeleteFiles getter/setter
         * @returns {String}
         */
        get DeleteFiles(){ return _.get(this).DeleteFiles; }
        set DeleteFiles( which ){
            try{
                _.get(this).DeleteFiles = is(which,"string","DeleteFiles")
            }catch(err){ errTracer(CLASSNAME,'setDeleteFiles',err); }
        }
        /**
         * List of Documents defined by the XML
         * @returns {DocumentInfo[]}
         */
        get Documents(){ return _.get(this).Documents; }
        /**
         * Add DocumentInfo object to Documents list
         * @param {DocumentInfo} documentObj DocumentInfo object to add to the Documents list
         */
        addDocument( documentObj ){
            try{
                _.get(this).Documents[documentObj.SeqNum] = documentObj;
            }catch(err){ errTracer(CLASSNAME,'addDocument',err); }
        }
    }
    return BatchInfo;
})();
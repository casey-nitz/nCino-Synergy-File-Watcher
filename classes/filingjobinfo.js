const { is, errTracer } = require('./utilities');
const CLASSNAME = 'FilingJobInfo';
const xml2js = require('xml2js');
const parser = new xml2js.Parser();
const BatchInfo = require('./batchinfo');

module.exports = (() => {
    let _ = new Map();
    class FilingJobInfo {
        static parseFromXMLFile( xmlPath ){
            try{

                let xmlString = fs.readFileSync(xmlPath);
                let newFilingJob = null;
                parser.parseString(xmlString, function (err, result) {
                    if( err ) throw new Error(err);
                    if( result && result.FilingJob ){
                        // console.log('result:',result);
                        newFilingJob = new FilingJobInfo( xmlPath );
                        if( result.FilingJob.Batch ){
                            for( let i=0; i < result.FilingJob.Batch.length; i++ ){
                                newFilingJob.addBatch( BatchInfo.mkFromParsedXML( result.FilingJob.Batch[i] ) );
                        }
                    }
                }
                else throw new Error("Batch XML invalid format");
            });
            return newFilingJob;
        }catch(err){ errTracer(CLASSNAME,'parseFromXMLFile',err) }
        }

        constructor( xmlPath ){
            try{
                let obj = {
                    FileLocation : is(xmlPath,"string","FileLocation"),
                    Batches : {}
                }
                _.set(this,obj);
            }catch(err){ errTracer(CLASSNAME,'constructor',err) }
        }

        get Batches() { return _.get(this).Batches; }
        addBatch( batchObject ){
            try{
                this.Batches[batchObject.SeqNum] = batchObject;
            }catch(err){ errTracer( CLASSNAME,'addBatch',err); }
        }
        get FileLocation(){ return _.get(this).FileLocation; }
        set FileLocation( which ){
            try{
                _.get(this).FileLocation = is(which,"string","FileLocation")
            }catch(err){ errTracer(CLASSNAME,'setFileLocation',err); }
        }
    }
    return FilingJobInfo;
})();
const { is, errTracer } = require('./utilities');
const CLASSNAME = 'FilingJobInfo';
const xml2js = require('xml2js');
const parser = new xml2js.Parser();
const BatchInfo = require('./batchinfo');
const fs = require('fs');
const path = require('path');

module.exports = (() => {
    let _ = new WeakMap();
    /**
     * Standard object for Synergy XML files
     */
    class FilingJobInfo {
        /**
         * Given the path to the XML file, automatically builds and returns a FilingJobInfo object
         * @param {String} xmlPath Path to XML file to be parsed
         * @returns {FilingJobInfo}
         */
        static buildFromXMLFile( xmlPath ){
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
            }catch(err){ errTracer(CLASSNAME,'buildFromXMLFile',err) }
        }
        /**
         * FilingJob constructor
         * @param {String} xmlPath Path to the XML file
         */
        constructor( xmlPath ){
            try{
                let obj = {
                    FileLocation : is(xmlPath,"string","FileLocation"),
                    //DocID : xmlPath.substring(xmlPath.lastIndexOf("/")+1,xmlPath.lastIndexOf('.')),
                    Batches : {}
                }
                let fileName = path.basename(xmlPath);
                obj.DocID = fileName.substring(0,fileName.lastIndexOf('.'))
                _.set(this,obj);
            }catch(err){ errTracer(CLASSNAME,'constructor',err) }
        }
        /**
         * List of BatchInfo objects representing the "Batches" tags within a Synergy XML file
         * @returns {BatchInfo[]}
         */
        get Batches() { return _.get(this).Batches; }
        addBatch( batchObject ){
            try{
                this.Batches[batchObject.SeqNum] = batchObject;
            }catch(err){ errTracer( CLASSNAME,'addBatch',err); }
        }
        /**
         * Getter and setter for FileLocation. Setting FileLocation also sets the DocID, parsed from the file name
         * @returns {String}
         */
        get FileLocation(){ return _.get(this).FileLocation; }
        set FileLocation( which ){
            try{
                _.get(this).FileLocation = is(which,"string","FileLocation")
                let FileName = path.basename(which);
                _.get(this).DocID = FileName.substring(0,FileName.indexOf('.'));
            }catch(err){ errTracer(CLASSNAME,'setFileLocation',err); }
        }
        /**
         * Getter for DocID. No setter defined beause it's set by the FileLocation setter
         * @returns {String}
         */
        get DocID(){ return _.get(this).DocID; }
    }
    return FilingJobInfo;
})();
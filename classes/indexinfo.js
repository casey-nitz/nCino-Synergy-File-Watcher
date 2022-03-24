const { is, errTracer } = require('./utilities');
const CLASSNAME = 'IndexInfo';
const xml2js = require('xml2js');
const parser = new xml2js.Parser();

module.exports = (() => {
    let _ = new WeakMap();
    /**
     * Object representing one individual "index" from a Synergy XML file
     */
    class IndexInfo {
        /**
         * Simple constructor
         * @param {string} name Index Name
         * @param {string} value Value associated with the index
         */
        constructor( name, value ){
            try{
                let obj = {
                    Name : is(name,"string","name"),
                    Value : is(value,"string","value")
                }
                _.set(this,obj);
            }catch(err){ errTracer()}
        }
        /**
         * Simple getter/setter for Name
         * @returns {String}
         */
        get Name(){ return _.get(this).Name; }
        set Name( which ){
            _.get(this).Name = is(which,"string","Name")
        }
        /**
         * Simple gettter/setter for Value
         * @returns {String}
         */
        get Value(){ return _.get(this).Value; }
        set Value( which ){
            _.get(this).Value = is(which,"string","Value")
        }
    }
    return IndexInfo;
})();
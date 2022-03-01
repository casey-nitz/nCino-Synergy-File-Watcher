const { is, errTracer } = require('./utilities');
const CLASSNAME = 'IndexInfo';
const xml2js = require('xml2js');
const parser = new xml2js.Parser();

module.exports = (() => {
    let _ = new Map();
    class IndexInfo {
        mkFromParsedXML( obj ){
            
        }
        constructor( name, value ){
            try{
                let obj = {
                    name : is(name,"string","name"),
                    value : is(value,"string","value")
                }
                _.set(this,obj);
            }catch(err){ errTracer()}
        }
        get name(){ return _.get(this).name; }
        set name( which ){
            _.get(this).name = is(which,"string","name")
        }
        get value(){ return this.value; }
        set value( which ){
            _.get(this).value = is(which,"string","value")
        }
    }
    return IndexInfo;
})();
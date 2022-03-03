const { is, errTracer } = require('./utilities');
const CLASSNAME = 'IndexInfo';
const xml2js = require('xml2js');
const parser = new xml2js.Parser();

module.exports = (() => {
    let _ = new Map();
    class IndexInfo {
        constructor( name, value ){
            try{
                let obj = {
                    Name : is(name,"string","name"),
                    Value : is(value,"string","value")
                }
                _.set(this,obj);
            }catch(err){ errTracer()}
        }
        get Name(){ return _.get(this).Name; }
        set Name( which ){
            _.get(this).Name = is(which,"string","Name")
        }
        get Value(){ return _.get(this).Value; }
        set Value( which ){
            _.get(this).Value = is(which,"string","Value")
        }
    }
    return IndexInfo;
})();
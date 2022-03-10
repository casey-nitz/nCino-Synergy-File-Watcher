module.exports = {
    is : function(value,type,fieldname){
        if( value == null || value == undefined )
            throw new Error("Value of " + fieldname + " null or undefined");
        else{
            switch( type ){
                case "string" : case "number":
                    if( (typeof value) !== type )
                        throw new Error("Invalid " + type + ". Field: " + fieldname + " Value: " + value);
                    else return value;
                case "date" :
                    if( value instanceof Date )
                        return value;
                    else throw new Error('Invalid Date. Field: ' + fieldname + " Value: " + value);
                default: throw new Error("No Type specified for validation on field " + fieldname);
            }
        }
    },
    errTracer(className,fxnName,err){
        throw new Error('Error in ' + className + " attempting to execute function " + fxnName + " : " + err);
    },
    PROJECTDIR : "C:\\Users\\cnitz\\Documents\\workspace\\nCino-Synergy-File-Watcher\\"
};
module.exports = {
    is : function(value,type,fieldname){
        if( value == null || value == undefined )
            throw new Error("Value of " + fieldname + " null or undefined");
        else{
            switch( type ){
                case "string" :
                    if( (typeof value) !== "string" )
                        throw new Error("Invalid String. Field: " + fieldname + " Value: " + value);
                    else return value;
                default: throw new Error("No Type specified for validation on field " + fieldname);
            }
        }
    },
    errTracer(className,fxnName,err){
        throw new Error('Error in ' + className + " attempting to execute function " + fxnName + " : " + err);
    }
};
module.exports = {
    /**
     * Type checker. Enforces that a parameter is neither undefined nor null, and is the type we expect it to be
     * 
     * Currently supports 'string', 'number', and 'date'
     * @param {Generic} value Variable value to be checked
     * @param {String} type Type we expect the variable to be
     * @param {String} fieldname Name of field, printed in the error message if type doesn't match
     * @returns 
     */
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
    /**
     * Error handler. Allows try/catch blocks at every level without losing information
     * @param {String} className Class in which the error was thrown
     * @param {String} fxnName Function in which the error was thrown
     * @param {Error} err Error, which should have been caught by try/catch 
     */
    errTracer(className,fxnName,err){
        let newErr = new Error('\nError in ' + className + " attempting to execute function " + fxnName);
        newErr.stack += err.stack;
        throw newErr;
    },
    /**
     * Project directory, used to reference file locations within the project
     */
    PROJECTDIR : "C:\\Users\\cnitz\\Documents\\GitHub\\nCino-Synergy-File-Watcher\\"
};
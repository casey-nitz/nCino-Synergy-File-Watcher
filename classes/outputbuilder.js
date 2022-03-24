const CLASSNAME = "OutputBuilder";
const DELIM = "\n";

module.exports = (() => {
    let _ = new WeakMap();
    /**
     * Contains static methods for formatting nCinoXML objects into readable output in different ways
     */
    class OutputBuilder{
        /**
         * Given a list of objects, returns a CSV file describing the fields of each nCinoXML
         * @param {nCinoXML[]} xmlObjectList List of nCinoXML objects
         * @param {String[]} fieldList List of fields to include in the CSV output
         * @returns {String}
         */
        static returnCSV( xmlObjectList, fieldList ){
            // console.log('fieldList:');
            // console.log(fieldList);
            let outputString = fieldList.join(',') + DELIM;
            for( let o = 0; o < xmlObjectList.length; o++ ){
                let obj = xmlObjectList[o];
                for( let i= 0; i < fieldList.length; i++ ){
                    let field = fieldList[i]
                    //console.log(obj,field);
                    let curValue = obj[field];
                    if( i !== 0 ) outputString +=',';
                    if( typeof curValue == "string" )
                        outputString += obj[field].replaceAll(',',' ')
                    else if( field == 'SynergyFileDate' ){
                        console.log('filedate??',curValue,typeof curValue);
                        curValue = new Date(curValue);
                        outputString += curValue.toLocaleString();
                    }
                }
                if( fieldList.length !== 0 )
                    outputString += DELIM;
            }
            //console.log('csv:',outputString)
            return outputString;
        }
        /**
         * Given a list of objects, returns an HTML Table string describing the fields of each nCinoXML
         * @param {nCinoXML[]} xmlObjectList List of nCinoXML objects
         * @param {String[]} fieldList List of fields to include in the CSV output
         * @returns {String} HTML table-formatted string
         */
        static returnHTMLTable( xmlObjectList, fieldList ){
            //console.log('fieldlist:',fieldList);
            let outputString = "<table id='tblOutputBuilder'> <tr>"
            fieldList.forEach((field) =>{
                outputString += "<th>" + field + "</th>";
            })
            outputString += "</tr>"
            "<th>Document ID</th> <th>Name</th> <th>Document Name</th> <th>Institution</th> </tr>";
            //console.log('fieldList:')
            //console.log(fieldList)
            for( let key in xmlObjectList ){
                outputString += "<tr>"
                fieldList.forEach((field) => {
                    //console.log('field:',field,'val:',xmlObject[key][field])
                    if( field === "SynergyFileDate" ){
                        //console.log('filedate??',xmlObjectList[key][field],typeof xmlObjectList[key][field]);
                        let d = new Date(xmlObjectList[key][field]);
                        outputString += "<td>" + d.toLocaleString() + "</td>"
                    }
                    else outputString += "<td>" + xmlObjectList[key][field] + "</td>"
                })
                outputString += "</tr>"
                // outputString += "<tr>";
                // outputString += "<td>"+xmlObject[key].DocID + "</td><td>" + xmlObject[key].NAME + "</td><td>" + xmlObject[key].DocName + "</td><td>" + xmlObject[key].Institution + "</td>";
                // outputString += "</tr>";
            }
            outputString += "</table>";
            return outputString;
        }
    }
    return OutputBuilder;
})();
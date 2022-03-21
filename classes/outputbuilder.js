const CLASSNAME = "OutputBuilder";
const DELIM = "\n";

module.exports = (() => {
    let _ = new WeakMap();
    class OutputBuilder{
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
        static returnHTMLTable( xmlObject, fieldList ){
            //console.log('fieldlist:',fieldList);
            let outputString = "<table id='tblOutputBuilder'> <tr>"
            fieldList.forEach((field) =>{
                outputString += "<th>" + field + "</th>";
            })
            outputString += "</tr>"
            "<th>Document ID</th> <th>Name</th> <th>Document Name</th> <th>Institution</th> </tr>";
            //console.log('fieldList:')
            //console.log(fieldList)
            for( let key in xmlObject ){
                if( key !== 'outputString' ){
                    outputString += "<tr>"
                    fieldList.forEach((field) => {
                        //console.log('field:',field,'val:',xmlObject[key][field])
                        if( field === "SynergyFileDate" ){
                            console.log('filedate??',xmlObject[key][field],typeof xmlObject[key][field]);
                            let d = new Date(xmlObject[key][field]);
                            outputString += "<td>" + d.toLocaleString() + "</td>"
                        }
                        else outputString += "<td>" + xmlObject[key][field] + "</td>"
                    })
                    outputString += "</tr>"
                    // outputString += "<tr>";
                    // outputString += "<td>"+xmlObject[key].DocID + "</td><td>" + xmlObject[key].NAME + "</td><td>" + xmlObject[key].DocName + "</td><td>" + xmlObject[key].Institution + "</td>";
                    // outputString += "</tr>";
                }
            }
            outputString += "</table>";
            return outputString;
        }
    }
    return OutputBuilder;
})();
const {is, errTracer} = require('./utilities');
const CLASSNAME = "EmailController";
const nodemailer = require("nodemailer");

module.exports = (() => {
    class EmailController{
        static SendXMLInformation( recipients ){
            try{

                "<h3>Errors occurred on the nCino Synergy AutoImport process for the following records:</h3><br/>" + msg.replace('\n','<br/>')
            }catch(err){ errTracer(CLASSNAME,'SendEmail') }
        }
        static SendEmail( recipients, subject, msg ){
            is(recipients,'string','recipients');
            is(subject,'string','subject');
            is(msg,'string','msg');
            let transporter = nodemailer.createTransport({
                host:"email.marinecu.com",
                port: 25
            });
            transporter.sendMail({
                from: '"nCino Synergy Monitor" <info@marinecu.com>', // sender address
                to: recipients, // list of receivers
                subject: subject, // Subject line
                html: msg, // plain text body
            }).then((res) => {
                if( res && res.accepted.length )
                    console.log('Accepted:',res.accepted)
                if( res && res.rejected.length )
                    console.log('Rejected:',res.rejected)
            }).catch((err) => console.error(err));
        }
    }
    return EmailController;
})();
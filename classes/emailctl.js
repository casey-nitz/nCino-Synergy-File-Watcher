const {is, errTracer} = require('./utilities');
const CLASSNAME = "EmailController";
const nodemailer = require("nodemailer");

module.exports = (() => {
    /**
     * Class with static method for sending an email through the standard MCU SMTP server
     */
    class EmailController{
        /**
         * Sends an email with the given parameters as defined. Sent from info@marinecu.com
         * @param {String} recipients List of recipients, comma-delimited
         * @param {String} subject Subject line of email to be sent
         * @param {String} msg Message body. Can be plain text or HTML-formatted
         */
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
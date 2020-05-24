require('dotenv').config();

var Airtable = require('airtable');
var base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.DB_KEY);
const nodemailer = require("nodemailer");

base('Table 1').select({
    maxRecords: 5,
    view: "Grid view"
}).eachPage(function page(records, fetchNextPage) {
    records.forEach(function(record) {
        let email = record.get('Email');
        let name = record.get('Name');
        if(email != undefined) {
            main(name, email).catch(console.error);
        }
    });
    fetchNextPage();
}, function done(err) {
    if (err) { console.error(err); return; }
});    


async function main(organization, reciever) {
    let transporter = nodemailer.createTransport({
    service:"Gmail",
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD 
    }
});
  
    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"Animal Welfare" <' + process.env.EMAIL_USERNAME + '>', // sender address
      to: reciever, // list of receivers
      subject: "Animal Welfare Database", // Subject line
      text: "Dear "  + organization + ",\nHello. This is a test!\nYours Truly,\nAnimal Welfare Database" // plain text body
    });
  
    console.log("Message sent to " + organization + " @ " + reciever );
  }


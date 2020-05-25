require('dotenv').config();

var Airtable = require('airtable');
var base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.DB_KEY_TEST);
const GoogleSpreadsheet = require('google-spreadsheet');
const {promisify} = require('util');
let samplearray = ["Nonprofit"];

const creds  = require('./client_secret.json');

function printData(record) {
    console.log(`Organization Name: ${record.initiativename}`)
    console.log(`Program: ${record.program}`);
    console.log(`Website: ${record.website}`);
}

function addToAirtable(record) {
    base('Programs & initiatives').create([
        {
            "fields": {
                "Initiative": record.initiativename,
                "Website": record.website,
                "Country": [
                    "USA"
                ],
                "State": record.state,
                "Address": record.address,
                "Contact Number": record.contactnumber,
                "Email": record.email,
                "Help needed": record.helpneeded,
                "Help offered": record.helpoffered,
                "Logo": [
                    {
                      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/SNice.svg/1200px-SNice.svg.png"
                    }
                ],
                "Program": formatString(record.program)
              }
            }
            ], {typecast: true}, function(err, records) {
            if (err) {
              console.error(err);
              return;
            }
            records.forEach(function (record1) {
              console.log(`Added: ${record1.getId()}`);
              printData(record);
              console.log(`---------------------------`);
            });
    });
            
}

function updateAirtable(airtableID, record) {
    base('Programs & initiatives').update([
        {
            "id": airtableID,
            "fields": {
                "Initiative": record.initiativename,
                "Website": record.website,
                "Country": [
                    "USA"
                ],
                "State": record.state,
                "Address": record.address,
                "Contact Number": record.contactnumber,
                "Email": record.email,
                "Help needed": record.helpneeded,
                "Help offered": record.helpoffered,
                "Logo": [
                    {
                      "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/SNice.svg/1200px-SNice.svg.png"
                    }
                ],
                "Program": formatString(record.program)
            }
        }
    ], {typecast: true}, function(err, records) {
            if (err) {
              console.error(err);
              return;
            }
            records.forEach(function (record1) {
              console.log(`Updated: ${record1.getId()}`);
              printData(record);
              console.log(`---------------------------`);
            });
    });
            
}

async function accessSpreadsheet() {
    const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID_TEST);
    await promisify(doc.useServiceAccountAuth)(creds);
    const info = await promisify(doc.getInfo)();
    readSheetRows(info.worksheets[0]);
}

async function readSheetRows(sheet) {
    const rows = await promisify(sheet.getRows)({
        offset: 1
    });

    rows.forEach(row=> {
        base('Programs & initiatives').select({
            maxRecords: 1,
            filterByFormula: `{Initiative} = "${row.initiativename}"`
        }).firstPage(function(err, records) {
            if (err) { 
                console.error(err); 
                return; 
            } 
            records.forEach(function(record) {
                updateAirtable(record.getId(), row);
            });
            if(!records.length) {
                addToAirtable(row);
            }
        });
    });
}

function formatString(str) {
    if(str.length == 1 && str[0].equals(" ")) {
       str = [];
    }
    return str.split(", ");
}

accessSpreadsheet();
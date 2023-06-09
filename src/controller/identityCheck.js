const strftime = require('strftime');
var config = require('../model/dbconfig');
const sql = require('mssql');
const Contact = require('../model/Contact');
const ResponseObjcet = require('../model/ResponseObject');

exports.identify = async function(req, res) {
    try{ 
        const email = req.body.email;
        const phoneNumber = req.body.phoneNumber;
        let pool = await sql.connect(config);
        console.log('db connected');
        


        let emailMatchResult = await pool.request().query(`SELECT id, linkedID, linkPrecedence FROM Customer WHERE email = '${email}' ORDER BY createdAt ASC`);
        let phoneNumberMatchResult = await pool.request().query(`SELECT id, linkedID, linkPrecedence FROM Customer WHERE phoneNumber = '${phoneNumber}' ORDER BY createdAt ASC`);
        let emailMatchCount = emailMatchResult.recordset.length;
        let phoneNumberMatchCount = phoneNumberMatchResult.recordset.length;

        // Entry not at all present, then create new entry
        if(emailMatchCount == 0 && phoneNumberMatchCount == 0) {
            //using stored procedure insertCustomer, which helps to insert a customer row
            console.log("inserting new customer entry");
            await pool.request()
            .input('phoneNumber', sql.NVarChar, phoneNumber)
            .input('email', sql.NVarChar, email)
            .input('linkedID', sql.Int, null)
            .input('linkPrecedence', sql.NVarChar, 'primary')
            .input('createdAt', sql.DateTime, new Date())
            .input('updatedAt', sql.DateTime, new Date())
            .input('deletedAt', sql.DateTime, null)
            .execute('insertCustomer');
        } 
        // email or phoneNumber already present, so need to create a secondary entry
        else if((email != null && emailMatchCount == 0) || (phoneNumber != null && phoneNumberMatchCount == 0)) {
            let matchedResult = (emailMatchCount > 0) ? emailMatchResult : phoneNumberMatchResult;
            
            //now here can be 2 case, either the matched identity is primary or secondary
            // if it's primary
            if(matchedResult.recordset[0].linkPrecedence == 'primary') {
                await pool.request()
                    .input('phoneNumber', sql.NVarChar, phoneNumber)
                    .input('email', sql.NVarChar, email)
                    .input('linkedID', sql.Int, matchedResult.recordset[0].id)
                    .input('linkPrecedence', sql.NVarChar, 'secondary')
                    .input('createdAt', sql.DateTime, new Date())
                    .input('updatedAt', sql.DateTime, new Date())
                    .input('deletedAt', sql.DateTime, null)
                    .execute('insertCustomer');
            }
            //if it's secondary 
            else if(matchedResult.recordset[0].linkPrecedence == 'secondary') { 
                await pool.request()
                    .input('phoneNumber', sql.NVarChar, phoneNumber)
                    .input('email', sql.NVarChar, email)
                    .input('linkedID', sql.Int, matchedResult.recordset[0].linkedID)
                    .input('linkPrecedence', sql.NVarChar, 'secondary')
                    .input('createdAt', sql.DateTime, new Date())
                    .input('updatedAt', sql.DateTime, new Date())
                    .input('deletedAt', sql.DateTime, null)
                    .execute('insertCustomer');
            }

        } 
        // if both of them already present then we won't make new entry, but there's a chance for update of existing entries
        else if(emailMatchCount > 0 && phoneNumberMatchCount > 0) {
            let phoneNumberPrimaryId = (phoneNumberMatchResult.recordset[0].linkPrecedence == 'primary') ? phoneNumberMatchResult.recordset[0].id : phoneNumberMatchResult.recordset[0].linkedID;
            let emailPrimaryId = (emailMatchResult.recordset[0].linkPrecedence == 'primary') ? emailMatchResult.recordset[0].id : emailMatchResult.recordset[0].linkedID;
            console.log(phoneNumberPrimaryId, emailPrimaryId);
            // if both of them are not equal then we will make newer primary entry as secondary, and that'll affect it's secondary entries as well
            if(phoneNumberPrimaryId != emailPrimaryId) {
                let phoneNumberPrimaryIdCreatedAt=  await pool.request().query(`SELECT createdAt FROM Customer WHERE id = '${phoneNumberPrimaryId}'`);
                let emailPrimaryIdCreatedAt=  await pool.request().query(`SELECT createdAt FROM Customer WHERE id = '${emailPrimaryId}'`);
                //phoneNumberPrimaryIdCreatedAt is older
                if(phoneNumberPrimaryIdCreatedAt < emailPrimaryIdCreatedAt) {
                    await pool.request().query(`UPDATE Customer
                    SET linkedID = ${phoneNumberPrimaryId}, linkPrecedence = 'secondary', updatedAt = ${strftime('%Y-%m-%d %H:%M:%S', new Date())}
                    WHERE id = ${emailPrimaryId} OR linkedID = ${emailPrimaryId};`);
                } 
                //emailPrimaryIdCreatedAt is older
                else {
                    await pool.request().query(`UPDATE Customer
                    SET linkedID = ${emailPrimaryId}, linkPrecedence = 'secondary', updatedAt = '${strftime('%Y-%m-%d %H:%M:%S', new Date())}'
                    WHERE id = ${phoneNumberPrimaryId} OR linkedID = ${phoneNumberPrimaryId};`);
                }
            }
        }

        //creating response object for the API
        let primaryContactId, emails = new Set(), phoneNumbers = new Set(), secondaryContactIds = new Set();

        let sqlResponse = await pool.request().query(`SELECT id, linkedID, linkPrecedence FROM Customer WHERE phoneNumber = '${phoneNumber}' OR email = '${email}' ORDER BY createdAt ASC`);
        primaryContactId = (sqlResponse.recordset[0].linkPrecedence == 'primary') ? sqlResponse.recordset[0].id : sqlResponse.recordset[0].linkedID;
        let primarySqlResponse = await pool.request().query(`SELECT  phoneNumber, email FROM Customer WHERE id = '${primaryContactId}'`);
        (primarySqlResponse.recordset[0].phoneNumber != null) ? phoneNumbers.add(primarySqlResponse.recordset[0].phoneNumber) : phoneNumbers ;
        (primarySqlResponse.recordset[0].email != null) ? emails.add(primarySqlResponse.recordset[0].email) : emails ;
        
        let secondarySqlResponse = await pool.request().query(`SELECT phoneNumber, email, id FROM Customer WHERE linkedId = '${primaryContactId}'`);
        secondarySqlResponse.recordset.forEach(function(element) {
            if(element.phoneNumber != null) {
                phoneNumbers.add(element.phoneNumber);
            }
            if(element.email != null) {
                emails.add(element.email);
            }
            secondaryContactIds.add(element.id);
            console.log(element);
        })
        const contact = new Contact(primaryContactId, Array.from(emails), Array.from(phoneNumbers), Array.from(secondaryContactIds));

        res.status(200).json(new ResponseObjcet(contact));
    } catch(error) {
        console.error('unexpected error occurred! ', error);
    }
}
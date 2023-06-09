class Contact{
    constructor(primaryContactId, emails, phoneNumbers, secondaryContactIds){
        this.primaryContactId = primaryContactId; 
        this.emails = emails; 
        this.phoneNumbers = phoneNumbers;
        this.secondaryContactIds = secondaryContactIds;
    }
}

module.exports = Contact;
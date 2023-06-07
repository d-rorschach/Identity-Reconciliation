class Customer{
    constructor(id, phoneNumber, email, linkedId, linkPrecedence, createdAt, updatedAt, deletedAt){
        this.id = id; 
        this.phoneNumber = phoneNumber; 
        this.email = email;
        this.linkedId = linkedId;
        this.linkPrecedence = linkPrecedence; 
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}

module.exports = Customer;
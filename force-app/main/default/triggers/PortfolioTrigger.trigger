trigger PortfolioTrigger on Portfolio__c (
before insert, after insert, 
before update, after update,
before delete, after delete, after undelete) {


if (Trigger.isBefore) {
        if (Trigger.isInsert) {
            PortfolioHandler.populateAmount(trigger.new);
          } 
        if (Trigger.isUpdate) {
           
            
} 
        if (Trigger.isDelete) {

        } 
    } 
    if (Trigger.isAfter) {
        if (Trigger.isInsert) {
          
            
        } 
        if (Trigger.isUpdate) {
            
           
        } 
        if (Trigger.isDelete) {

        } 
        if (Trigger.isUndelete) {

        }
    }  
}
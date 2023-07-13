trigger InvestmentHoldingMasterTrigger on Investment__c (
    before insert, after insert, 
    before update, after update,
    before delete, after delete, after undelete) {
    

    if (Trigger.isBefore) {
            if (Trigger.isInsert) {
            //    InvestmentHandler.createSharesRemaining(trigger.new);
              } 
            if (Trigger.isUpdate) {
               
                // InvestmentHandler.updateSharesRemaining(trigger.new);
} 
            if (Trigger.isDelete) {

            } 
        } 
        if (Trigger.isAfter) {
            if (Trigger.isInsert) {
              InvestmentHandler.createBuyHistory(trigger.new);
                
            } 
            if (Trigger.isUpdate) {
                InvestmentHandler.createSellHistory(trigger.new);
                // InvestmentHandler.callOutBuySell(trigger.new);
            } 
            if (Trigger.isDelete) {

            } 
            if (Trigger.isUndelete) {

            }
        }  
}
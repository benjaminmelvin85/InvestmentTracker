public with sharing class PortfolioHandler {
    

    public static void populateAmount(List<Portfolio__c> portList) {

        for (Portfolio__c inv : portList) {
        Id parameter = inv.Id;
        List<Portfolio__c> updatedList = new List<Portfolio__c>();

    
    // Portfolio__c port = [Select Id, Cash_Available__c, Deposit__c from Portfolio__c Where Id = :parameter];
    Decimal myDeposit = inv.Deposit__c;

    inv.Cash_Available__c = myDeposit;
  
}
    
// if (!portList.isEmpty()) {
                    
//     update portList;
//     }
}
}
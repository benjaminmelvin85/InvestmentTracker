public class MonthlyEmail implements Schedulable {
    public void execute(SchedulableContext sc) {
        List<Messaging.SingleEmailMessage> emailList = new List<Messaging.SingleEmailMessage>();
        //back
        Date last30Days = Date.today().addDays(-30);
        
        List<Trading_History__c> myList = [SELECT Id, Initial_Buy_Value__c, Transaction_Value__c, Symbol__c, Quantity__c, Sum_of_Sold__c, Portfolio__r.Client__r.Client_Email__c, Portfolio__r.Client__r.Name 
                                           FROM Trading_History__c
                                           WHERE (Initial_Buy_Value__c < 20000 AND Transaction_Value__c < 20000) 
                                           AND CreatedDate >= :last30Days];
        
        for (Trading_History__c th : myList) {
            Portfolio__c port = th.Portfolio__r;
            Contact con = port.Client__r;
            String clientEmail = con.Client_Email__c;
            String clientName = con.Name;
            String symbol = th.Symbol__c;
            Decimal soldAmount = th.Sum_of_Sold__c;
            Decimal buyAmount = th.Quantity__c;
            Double initialCost = th.Initial_Buy_Value__c;
            Double transactionVal = th.Transaction_Value__c;
            Double myMoney = 0;
            Decimal myShares = 0;
            
            if (transactionVal == 0) {
                myMoney += initialCost;
            } else {
                myMoney += initialCost;
            }
            
            if (soldAmount == 0) {
                myShares += soldAmount;
            } else {
                myShares += buyAmount;
            }
            
            Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
            email.setToAddresses(new List<String>{clientEmail});
            email.setSubject(clientName + ' Trade Alert: Standard Trade');
            email.setPlainTextBody('You bought ' + myShares + ' of ' + symbol + ' stock, for a total purchase price of ' + myMoney + '. ' + clientEmail);

            emailList.add(email);
        }
        
        Messaging.sendEmail(emailList);
        System.debug('Your email sent');
    }
}

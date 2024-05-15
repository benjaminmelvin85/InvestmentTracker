public class BatchEmail implements Database.Batchable<sObject> {
    
    public Database.QueryLocator Start (Database.BatchableContext bc) {
        // so confused
        return Database.getQueryLocator('Select Id, Initial_Buy_Value__c, Transaction_Value__c, Portfolio__r.Client__r.Client_Email__c, Portfolio__r.Client__r.Name From Trading_History__c Where Initial_Buy_Value__c >20000 Or Transaction_Value__c > 20000');
    }
    public void execute (Database.BatchableContext bc, List<sObject> myList) {
        List<Messaging.SingleEmailMessage> emailList = new List<Messaging.SingleEmailMessage>();
        
        for (SObject th : myList) {
            Trading_History__c myRecord = (Trading_History__C)th;
            Id myId = th.Id;
            system.debug(myId);
            Portfolio__c port = myRecord.Portfolio__r;
            Contact con = port.Client__r;
            String ClientEmail = con.Client_Email__c;
            String ClientName = con.Name;
            system.debug(ClientEmail);
            Double initialCost = myRecord.Initial_Buy_Value__c;
            Double transactionVal = myRecord.Transaction_Value__c;
            Double myMoney = 0;
            if (transactionVal == 0) {
                myMoney += initialCost;
            } else {
                myMoney += initialCost;
            }
            String myEmail;

            Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
            email.setToAddresses(new List<String>{myEmail});
            email.setSubject(ClientName +' Trade Alert: High Value Trade');
            email.setPlainTextBody('A trade of ' + myMoney +  ' has been made' + ClientEmail );

            emailList.add(email);
            
        }
        Messaging.sendEmail(emailList);
    }
    public void Finish (Database.BatchableContext bc) {
        system.debug('your email sent');
    }
}
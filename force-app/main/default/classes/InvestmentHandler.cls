public with sharing class InvestmentHandler {

    // public static Void callOutBuySell(List<Investment__c> invList) {
    //     List<Id> myList = new List<Id>();
    //     for (Investment__c inv : invList) {
    //         myList.add(inv.Id);
    //     }
    //     CallOutBuySell.transaction(myList);
    // }
    
    public static void createBuyHistory(List<Investment__c> invList) {
       
          List<Id> invId = new List<Id>();
          List<Id> myList = new List<Id>();
        for (Investment__c inv : invList) {
            myList.add(inv.Id);
        
       
            SharePriceCall.makeCall(myList);
    }
        
   
    }



    public static void createSellHistory(List<Investment__c> invList) {
       
        List<Trading_History__c> sellList = new List<Trading_History__c>();
        List<Portfolio__c> portList = new List<Portfolio__c>();
        List<Id> myList = new List<Id>();
        for (Investment__c inv : invList) {
            myList.add(inv.Id);

        SellPriceCall.makeSell(myList);
            
        }

    }
    }

//     public static void updateSharesRemaining(List<Investment__c> invList) {
    

        

//         for (Investment__c inv : invList) {
//             Decimal checkAmount = inv.Shares_Remaining__c - inv.Shares_To_Sell__c;
            
//             if (checkAmount < 0) {
//                 inv.addError('You Don\'t have enough shares to make that transaction!');
//             } else {
//             inv.Shares_Remaining__c -= inv.Shares_To_Sell__c;
            
//             }
            
//     }
            


//         }
    
    
//     public static void createSharesRemaining(List<Investment__c> invList) {
//         List<Id> myList = new List<Id>();
//         for (Investment__c inv : invList) {
//             myList.add(inv.Id);
//         }
//         SharePriceCall.makeCall(myList);

//         for (Investment__c inv : invList) {
//             inv.Shares_Remaining__c =inv.Quantity__c;

// }
// }

// }
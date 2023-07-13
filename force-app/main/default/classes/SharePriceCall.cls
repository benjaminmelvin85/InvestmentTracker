public with sharing class SharePriceCall {

    // @future(callout = true)
    public static void makeCall(List<Id> invList) {
        List<Portfolio__c> portList = new List<Portfolio__c>();
        List<Trading_History__c> buyList = new List<Trading_History__c>();
            // String parameter;
            List<Investment__c> myList = [Select id, BUY_SELL__c, Symbol__c, Final__c, InitialVal__c, Total_Gain_Loss__c, Total_Purchase_Cost__c, Quantity__c, Portfolio__c, Purchase_Share_Price__c from Investment__c Where Id In :invList];
            List<Investment__c> updatedList = new List<Investment__c>();

            for (Investment__c inv : myList)  {
                // parameter = inv.Symbol__c;
                // String apiKey;
                // HttpRequest request = new HttpRequest();
                // request.setEndPoint('https://realstonks.p.rapidapi.com/' + parameter);
                // request.setMethod('GET');
                // request.setHeader('X-RapidAPI-key', apiKey);
                // Http h = new Http();
                // HttpResponse response = h.send(request);
                // system.debug(response);
                // system.debug(response.getStatusCode());
                // system.debug(response.getStatus());
                // system.debug(response.getBody());
                // system.debug(response);
                // Map<String, Object> deserialized = (Map<String, Object>)JSON.deserializeUntyped(response.getBody());
                // system.debug(deserialized.get('price'));
                // Decimal price = (Decimal) deserialized.get('price');

                // inv.Purchase_Share_Price__c = price;
                // // inv.Shares_Remaining__c = inv.Quantity__c;
                // inv.Shares_Remaining__c =inv.Quantity__c;
                // inv.Total_Purchase_Cost__c = inv.Quantity__c * price;
                
                // updatedList.add(inv);

                Trading_History__c newBuy = new Trading_History__c();
                    newBuy.RecordTypeId = '012Hs000000NU4kIAG';
                    newBuy.Transaction_Type__c = inv.BUY_SELL__c;
                    newBuy.Holdings__c = inv.Id;
                    newBuy.Amount_Sold__c = inv.Id;
                    NewBuy.Portfolio__c = inv.Portfolio__c;
                    newBuy.Price__c = inv.Purchase_Share_Price__c;
                    newBuy.Initial_Buy_Value__c = inv.Purchase_Share_Price__c * inv.Quantity__c;
                    

                        buyList.add(newBuy);

                Portfolio__c port = [Select Id, Cash_Available__c, Deposit__c, Total_Purchase_Cost__c from Portfolio__c Where Id = :inv.Portfolio__c];
                    
                    
                    port.Total_Purchase_Cost__c += inv.Quantity__c * inv.Purchase_Share_Price__c;
                    port.Cash_Available__c = port.Deposit__c - port.Total_Purchase_Cost__c;
                    portList.add(port);
                    }
                    // if (!updatedList.isEmpty()) {
                    // update updatedList;
                    // }
                    if (!buyList.isEmpty()) {
                        insert buyList;
            
                    }
                    if (!portList.isEmpty()) {
                    
                    update portList;
                    }

            }
     }
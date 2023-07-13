public with sharing class CallOutBuySell {
    @future(callout = true)
    public static void makeSellAndCall(List<Id> invList) {
        List<Portfolio__c> portList = new List<Portfolio__c>();
        List<Trading_History__c> sellList = new List<Trading_History__c>();
        List<Trading_History__c> buyList = new List<Trading_History__c>();
        String parameter;
        List<Investment__c> myList = [SELECT Id, BUY_SELL__c, Symbol__c, Shares_Remaining__c, Shares_To_Sell__c, Final__c, InitialVal__c, Total_Gain_Loss__c, Total_Purchase_Cost__c, Quantity__c, Portfolio__c, Purchase_Share_Price__c, Current_Share_Price__c FROM Investment__c WHERE Id IN :invList];
        List<Investment__c> updatedList = new List<Investment__c>();

        for (Investment__c inv : myList) {
            parameter = inv.Symbol__c;
            String apiKey;
            HttpRequest request = new HttpRequest();
            request.setEndPoint('https://realstonks.p.rapidapi.com/' + parameter);
            request.setMethod('GET');
            request.setHeader('X-RapidAPI-key', apiKey);
            Http h = new Http();
            HttpResponse response = h.send(request);
            System.debug(response);
            System.debug(response.getStatusCode());
            System.debug(response.getStatus());
            System.debug(response.getBody());
            System.debug(response);
            Map<String, Object> deserialized = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
            System.debug(deserialized.get('price'));
            Decimal price = (Decimal) deserialized.get('price');

            if (inv.BUY_SELL__c == 'Sell') {
                inv.Current_Share_Price__c = price;

                Trading_History__c newSell = new Trading_History__c();
                newSell.RecordTypeId = '012Hs000000NU4pIAG';
                newSell.Transaction_Type__c = inv.BUY_SELL__c;
                newSell.Holdings__c = inv.Id;
                newSell.Amount_Sold__c = inv.Id;
                newSell.Portfolio__c = inv.Portfolio__c;
                newSell.Transaction_Value__c = inv.Shares_To_Sell__c * price;
                newSell.Sum_of_Sold__c = inv.Shares_To_Sell__c;
                newSell.Initial_Buy_Value__c = inv.Quantity__c * inv.Purchase_Share_Price__c;

                sellList.add(newSell);

                Portfolio__c port = [SELECT Id, Total_Gain_Loss__c, Cash_Available__c, Deposit__c, Total_Purchase_Cost__c, Gain_Loss_Percentage__c, InitialVal__c, FinalVal__c FROM Portfolio__c WHERE Id = :inv.Portfolio__c];
                port.FinalVal__c += inv.Shares_To_Sell__c * price;
                port.InitialVal__c += inv.Shares_To_Sell__c * inv.Purchase_Share_Price__c;
                port.Total_Gain_Loss__c = port.FinalVal__c - port.InitialVal__c;
                port.Cash_Available__c += inv.Shares_To_Sell__c * price;
                port.Total_Purchase_Cost__c -= inv.Shares_To_Sell__c * inv.Purchase_Share_Price__c;
                port.Gain_Loss_Percentage__c = (port.FinalVal__c - port.InitialVal__c) / port.InitialVal__c * 100;
                portList.add(port);
            } else if (inv.BUY_SELL__c == 'Buy') {
                inv.Purchase_Share_Price__c = price;
                inv.Shares_Remaining__c = inv.Quantity__c;
                inv.Total_Purchase_Cost__c = inv.Quantity__c * price;

                updatedList.add(inv);

                Trading_History__c newBuy = new Trading_History__c();
                newBuy.RecordTypeId = '012Hs000000NU4kIAG';
                newBuy.Transaction_Type__c = inv.BUY_SELL__c;
                newBuy.Holdings__c = inv.Id;
                newBuy.Amount_Sold__c = inv.Id;
                newBuy.Portfolio__c = inv.Portfolio__c;
                newBuy.Price__c = price;
                newBuy.Initial_Buy_Value__c = price * inv.Quantity__c;

                buyList.add(newBuy);

                Portfolio__c port = [SELECT Id, Cash_Available__c, Deposit__c, Total_Purchase_Cost__c FROM Portfolio__c WHERE Id = :inv.Portfolio__c];
                port.Cash_Available__c = port.Deposit__c - (inv.Quantity__c * price);
                port.Total_Purchase_Cost__c = inv.Quantity__c * price;
                portList.add(port);
            }
        }

        if (!sellList.isEmpty()) {
            insert sellList;
        }

        if (!updatedList.isEmpty()) {
            update updatedList;
        }

        if (!buyList.isEmpty()) {
            insert buyList;
        }

        if (!portList.isEmpty()) {
            update portList;
        }
    }
}
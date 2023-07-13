public with sharing class SellPriceCall {
    
    // @future(callout = true)
    public static void makeSell(List<Id> invList) {
        List<Portfolio__c> portList = new List<Portfolio__c>();
        List<Trading_History__c> sellList = new List<Trading_History__c>();
            // String parameter;
            List<Investment__c> myList = [Select id, BUY_SELL__c, Symbol__c, Shares_Remaining__c, Shares_To_Sell__c, Final__c, InitialVal__c, Total_Gain_Loss__c, Total_Purchase_Cost__c, Quantity__c, Portfolio__c, Purchase_Share_Price__c, Current_Share_Price__c from Investment__c Where Id In :invList];
            List<Investment__c> holdList = new List<Investment__c>();
            
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
                // // inv.Shares_Remaining__c -= inv.Shares_To_Sell__c;
                // inv.Current_Share_Price__c = price;
                // // inv.Final__c += inv.Shares_To_Sell__c * price;
                // // inv.InitialVal__c += inv.Shares_To_Sell__c * inv.Purchase_Share_Price__c;
                // // inv.Total_Purchase_Cost__c -= inv.Shares_To_Sell__c * inv.Purchase_Share_Price__c;
                // // inv.Total_Gain_Loss__c = inv.Final__c - inv.InitialVal__c;
                // // system.debug(inv.Current_Share_Price__c);
                // // system.debug(inv.Final__c);
                // // system.debug(inv.InitialVal__c);
                // // try{
                //  // holdList.add(inv);
                // // } catch (Exception e) {
                // //     system.debug(e.getMessage());
                // // }

                







                Trading_History__c newSell = new Trading_History__c();
                newSell.RecordTypeId = '012Hs000000NU4kIAG';
                newSell.Transaction_Type__c = inv.BUY_SELL__c;
                newSell.Holdings__c = inv.Id;
                newSell.Amount_Sold__c = inv.Id;
                newSell.Portfolio__c = inv.Portfolio__c;
                newSell.Transaction_Value__c = inv.Shares_To_Sell__c * inv.Current_Share_Price__c;
                newSell.Sum_of_Sold__c = inv.Shares_To_Sell__c;
                newSell.Initial_Buy_Value__c = inv.Quantity__c * inv.Purchase_Share_Price__c;

                sellList.add(newSell);

                Portfolio__c port = [Select Id, Total_Gain_Loss__c, Cash_Available__c, Deposit__c, Total_Purchase_Cost__c, Gain_Loss_Percentage__c, InitialVal__c, FinalVal__c from Portfolio__c Where Id = :inv.Portfolio__c];
                port.FinalVal__c += inv.Shares_To_Sell__c * inv.Current_Share_Price__c;
                port.InitialVal__c += inv.Shares_To_Sell__c * inv.Purchase_Share_Price__c;
                port.Total_Gain_Loss__c = port.FinalVal__c - port.InitialVal__c;
                port.Cash_Available__c += inv.Shares_To_Sell__c * inv.Current_Share_Price__c;
                port.Total_Purchase_Cost__c -= inv.Shares_To_Sell__c * inv.Purchase_Share_Price__c;
                port.Gain_Loss_Percentage__c = (port.FinalVal__c - port.InitialVal__c) / port.InitialVal__c * 100;
                portList.add(port);
               
            }
           //  if (!holdList.isEmpty()) {
            //    upsert holdList;
           // }
                if (!sellList.isEmpty()) {
                    insert sellList;
                
                }
                if (!portList.isEmpty()) {
                    update portList;
                }
            }
        }
                            
        

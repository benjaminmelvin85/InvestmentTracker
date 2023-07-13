public with sharing class PriceUpdate {
    
    @future(callout = true)
    public static void makeUpdate(List<Id> invList) {
    String parameter;
    List<Investment__c> myList = [Select id, BUY_SELL__c, Symbol__c, Shares_Remaining__c, Shares_To_Sell__c, Final__c, InitialVal__c, Total_Gain_Loss__c, Total_Purchase_Cost__c, Quantity__c, Portfolio__c, Purchase_Share_Price__c, Current_Share_Price__c from Investment__c Where Id In :invList];
    List<Investment__c> holdList = new List<Investment__c>();
    
    for (Investment__c inv : myList)  {
        parameter = inv.Symbol__c;
        String apiKey;
        HttpRequest request = new HttpRequest();
        request.setEndPoint('https://realstonks.p.rapidapi.com/' + parameter);
        request.setMethod('GET');
        request.setHeader('X-RapidAPI-key', apiKey);
        Http h = new Http();
        HttpResponse response = h.send(request);
        system.debug(response);
        system.debug(response.getStatusCode());
        system.debug(response.getStatus());
        system.debug(response.getBody());
        system.debug(response);
        Map<String, Object> deserialized = (Map<String, Object>)JSON.deserializeUntyped(response.getBody());
        
        system.debug(deserialized.get('price'));
        Decimal price = (Decimal) deserialized.get('price');
        // inv.Shares_Remaining__c -= inv.Shares_To_Sell__c;
        inv.Current_Share_Price__c = price;
        holdList.add(inv);
}   
if(!holdList.isEmpty()) {
    update holdList;
}   

    }
}
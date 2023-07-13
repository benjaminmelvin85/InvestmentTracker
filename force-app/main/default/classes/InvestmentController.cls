public with sharing class InvestmentController {
    @AuraEnabled(cacheable=true)
    public static List<Investment__c> getInvestmentsByPortfolio(Id portfolioId) {
        return [SELECT Id, Name, Symbol__c, Quantity__c, BUY_SELL__c, Shares_To_Sell__c, Purchase_Share_Price__c, Shares_Remaining__c, Total_Gain_Loss__c, Total_Purchase_Cost__c, InitialVal__c, Final__c FROM Investment__c WHERE Portfolio__c = :portfolioId];
    }
}
public class PortfolioSorterController {
    private String sortField = 'Client__c';
    private String sortDirection = 'ASC';
    public String clientName {get; set;}
    public String clientExistsMessage {get; private set;}

    public List<Portfolio__c> getPortfolio() {
        List<Portfolio__c> results = Database.query('SELECT Id, Client__c, Cash_Available__c, Total_Gain_Loss__c, Deposit__c, Total_Purchase_Cost__c, Client__r.Client_Email__c, Client__r.Homephone ' +
                'FROM Portfolio__c ' +
                'ORDER BY ' + sortField + ' ' + sortDirection +
                ' LIMIT 10');
        return results;
    }

    public String getSortField() {
        return sortField;
    }

    public String getSortDirection() {
        return sortDirection;
    }

    public void sortPortfolio(String field) {
        if (sortField == field) {
            sortDirection = (sortDirection == 'ASC') ? 'DESC' : 'ASC';
        } else {
            sortField = field;
            sortDirection = 'ASC';
        }
    }

    public void sortByClient() {
        sortPortfolio('Client__c');
    }

    public void sortByCashAvailable() {
        sortPortfolio('Cash_Available__c');
    }

    public void sortByTotalGainLoss() {
        sortPortfolio('Total_Gain_Loss__c');
    }

    public void sortByDeposit() {
        sortPortfolio('Deposit__c');
    }

    public void sortByTotalPurchaseCost() {
        sortPortfolio('Total_Purchase_Cost__c');
    }
    public void sortByClientEmail() {
        sortPortfolio('Client__r.Client_Email__c');
    }
    public void sortByHomePhone() {
        sortPortfolio('Client__r.HomePhone');
    }
    
    public void checkClientExists() {
        List<Contact> results = [Select Id, Name From Contact Where Name =:ClientName Limit 1];
        if(results.isEmpty()) {
            clientExistsMessage = 'Client does not exist in Database';
        } else {
            clientExistsMessage = 'Client already exists in Database';
        }
    }
    
    
    
    
}
import { LightningElement, track, wire } from 'lwc';
import StockMC from '@salesforce/messageChannel/StockTransactionChannel__c';
import { subscribe, APPLICATION_SCOPE, MessageContext } from 'lightning/messageService';

export default class CongressInvestments extends LightningElement {
  @track stockSymbol = '';
  @track investments = [];
  subscription = null;

  // handleInputChange(event) {
  //   this.stockSymbol = event.target.value;
  // }
  @wire(MessageContext) 
    messageContext; 

    connectedCallback() {
      this.subscribeToMessageChannel();
     
  }
    subscribeToMessageChannel() {
        if(!this.subscription) {
            this.subscription = subscribe(
                this.messageContext,  StockMC, (message) => this.handleMessage(message), 
                { scope: APPLICATION_SCOPE
                });
        }
    }
    handleMessage(message) {
      this.stockSymbol = message.stockSymbol;
      this.handleSearch();
    }

    async handleSearch() {
      const apiKey;
      const url = 'https://financialmodelingprep.com/api/v4/senate-trading?symbol=' + this.stockSymbol + '&apikey=' + apiKey;
    
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Request failed with status ' + response.status);
        }
        const data = await response.json();
        const limitedData = data.slice(0, 10);
    
        this.investments = limitedData.map((investment) => ({
          lastName: investment.lastName,
          office: investment.office,
          link: investment.link,
          dateReceived: investment.dateReceived,
          transactionDate: investment.transactionDate,
          owner: investment.owner,
          assetDescription: investment.assetDescription,
          assetType: investment.assetType,
          type: investment.type,
          amount: investment.amount,
          comment: investment.comment,
          symbol: investment.symbol,
        }));
      } catch (error) {
        console.error('Error:', error);
      }
    }
    }


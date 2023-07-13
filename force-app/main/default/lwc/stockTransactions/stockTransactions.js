import { LightningElement, track } from 'lwc';
import { createRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import StockMC from '@salesforce/messageChannel/StockTransactionChannel__c';
import { publish, createMessageContext, releaseMessageContext} from 'lightning/messageService';
export default class StockTransactions extends LightningElement {
    @track stockSymbol = '';
    @track stockInfo;
    @track showBuyButton = false;
    @track quantity = 0;
    @track portfolioId = '';
    @track securityId = '';
    
   

    handleSymbolChange(event) {
        this.stockSymbol = event.target.value;
    }
 

    async handleSubmit(event) {
        event.preventDefault();
        await this.getStockInformation();
        
        this.template.querySelector('c-chart-component').childMethod();
        console.log('whats inside this event: '+ event.detail);
        const messageContext = createMessageContext();
        const message = {
            stockSymbol: this.stockSymbol
        };
        publish(messageContext, StockMC, message);
        releaseMessageContext(messageContext);
        
        
    }
    

    async getStockInformation() {
        const apiKey;
        const apiUrl = `https://financialmodelingprep.com/api/v3/quote-short/${this.stockSymbol}?apikey=${apiKey}`;
        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            if (data && data.length > 0) {
                this.stockInfo = {
                    symbol: data[0].symbol,
                    price: data[0].price,
                    volume: data[0].volume
                };
                this.showBuyButton = true;
            } else {
                this.stockInfo = null;
                this.showBuyButton = false;
            }
        } catch (error) {
            console.error('Error fetching stock information:', error);
            this.stockInfo = null;
            this.showBuyButton = false;
        }
    }

    handleBuyButtonClick() {
        if (this.quantity <= 0) {
            const toastEvent = new ShowToastEvent({
                title: 'Error',
                message: 'You must buy greater than 0 shares',
                variant: 'error'
            });
            this.dispatchEvent(toastEvent);
            return;
        }
        let amount = parseFloat(this.quantity * this.stockInfo.price);
        
        const fields = {};

        fields.BUY_SELL__c = 'BUY';
        fields.Quantity__c = this.quantity;
        fields.Portfolio__c = this.portfolioId;
        fields.Purchase_Share_Price__c = this.stockInfo.price;
        fields.Security__c = this.securityId;
        fields.Symbol__c = this.stockSymbol;
        fields.Total_Purchase_Cost__c = amount.toFixed(2);
        fields.Shares_Remaining__c = this.quantity;
        

        const investmentRecord = { apiName: 'Investment__c', fields };
        this.createRecord(investmentRecord);
    }

    createRecord(recordInput) {
        createRecord(recordInput)
            .then((result) => {
                console.log('Investment__c record created:', result.id);

                
                const toastEvent = new ShowToastEvent({
                    title: 'Success',
                    message: 'Stock purchased successfully',
                    variant: 'success'
                });
                this.dispatchEvent(toastEvent);

                
                refreshApex(this.wiredInvestmentsResult);
                setTimeout(() => {
                    location.reload();
                }, 2000);
            })
            .catch((error) => {
                console.error('Error creating Investment__c record:', error);

                
                const toastEvent = new ShowToastEvent({
                    title: 'Error',
                    message: 'Failed to purchase stock',
                    variant: 'error'
                });
                this.dispatchEvent(toastEvent);
            });
    }

    handleQuantityChange(event) {
        this.quantity = event.detail.value;
    }

    handlePortfolioChange(event) {
        this.portfolioId = event.detail.value[0];
    }

    handleSecurityChange(event) {
        this.securityId = event.detail.value[0];
    }
}
import { LightningElement, api, track } from 'lwc';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent, CustomEvent } from 'lightning/platformShowToastEvent';


export default class SellModal extends LightningElement {
    @api investmentId;
    @api stockSymbol;
    @api purchaseSharePrice;
    @api quantity;
    @api final;
    @api initial;
    @api total;

    @track currentSharePrice;
    @track quantityToSell = 0;
    // @track purchaseSharePrice;

    connectedCallback() {
        this.retrieveSharePrice();
        console.log('stockSymbol' + this.stockSymbol);
        console.log('investmentid' +this.investmentId);
        console.log('final: '+ this.final);
    }

    retrieveSharePrice() {
        const apiKey;
        const apiUrl = `https://financialmodelingprep.com/api/v3/quote-short/${this.stockSymbol}?apikey=${apiKey}`;

        fetch(apiUrl)
            .then((response) => response.json())
            .then((data) => {
                if (data.length > 0) {
                    this.currentSharePrice = data[0].price;
                    console.log('myData: ' + data[0].price);
                } else {
                    this.currentSharePrice = 'N/A';
                }
            })
            .catch((error) => {
                this.currentSharePrice = 'N/A';
                console.error('Error retrieving share price:', error);
            });
    }

    handleQuantityChange(event) {
        this.quantityToSell = event.target.value;
    }

    handleSell() {
        if(this.quantityToSell > this.quantity || this.quantityToSell <= 0) {
            const toastEvent = new ShowToastEvent({
                title: 'Error',
                message: 'Invalid amount of shares to sell',
                variant: 'error'
            });
            this.dispatchEvent(toastEvent);
            return;
        }
     
        const newFinalval = this.quantityToSell * this.currentSharePrice + parseFloat(this.final);
        const newInitialVal = this.quantityToSell * this.purchaseSharePrice + parseFloat(this.initial);
        const newTotalVal = parseFloat(this.total) - (this.quantityToSell * this.purchaseSharePrice);
        const fields = {
            BUY_SELL__c: 'SELL',
            Id: this.investmentId,
            Shares_Remaining__c: this.quantity - this.quantityToSell,
            Current_Share_Price__c: this.currentSharePrice,
            Final__c: newFinalval,
            InitialVal__c: newInitialVal,
            Total_Purchase_Cost__c: newTotalVal,
            Total_Gain_Loss__c: newFinalval - newInitialVal,
            Shares_To_Sell__c: this.quantityToSell
        };

        updateRecord({ fields })
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Investment record updated successfully',
                        variant: 'success'
                    })
                );
                setTimeout(() => {
                    location.reload();
                }, 3000);
                
                
            })
            .catch((error) => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Error updating investment record',
                        variant: 'error'
                    })
                );
                console.error('Error updating investment record:', error);
                console.log('Fields:', fields);
            console.log('Error body:', error.body);
            console.log('Error message:', error.message);
            console.log('Error detail:', error.detail);
            console.log('Error stack:', error.stack);
            });
    }
    handleCancel() {
        const toastEvent = new ShowToastEvent({
            title: 'Transaction Cancelled',
            message: 'Your transaction has been cancelled',
            variant: 'info'
        });
        
        this.dispatchEvent(toastEvent);
        setTimeout(() => {
        location.reload();
    }, 1000)
        
    }
}
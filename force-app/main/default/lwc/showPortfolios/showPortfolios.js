import { LightningElement, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getPortfolios from '@salesforce/apex/PortfolioController.getPortfolios';
import getInvestmentsByPortfolio from '@salesforce/apex/InvestmentController.getInvestmentsByPortfolio';

export default class ShowPortfolios extends NavigationMixin(LightningElement) {
    @track portfolioOptions = [];
    @track selectedPortfolio;
    @track investments = [];
    @track showModal = false;
    @track investmentIdForModal;
    @track stockSymbolForModal;
    @track purchaseSharePriceForModal;
    @track quantityForModal;
    @track finalForModal;
    @track initialForModal;
    @track totalPurchaseForModal;
    @track totalGLForModal;

    connectedCallback() {
        this.fetchPortfolios();
    }

    fetchPortfolios() {
        getPortfolios()
            .then((result) => {
                this.portfolioOptions = result.map((portfolio) => ({
                    label: portfolio.Name,
                    value: portfolio.Id
                }));
            })
            .catch((error) => {
                console.error('Error fetching portfolios:', error);
            });
    }

    handlePortfolioChange(event) {
        this.selectedPortfolio = event.detail.value;
        this.loadInvestments();
    }

    loadInvestments() {
        if (this.selectedPortfolio) {
            getInvestmentsByPortfolio({ portfolioId: this.selectedPortfolio })
                .then((result) => {
                    this.investments = result;
                })
                .catch((error) => {
                    console.error('Error fetching investments:', error);
                });
        } else {
            this.investments = [];
        }
    }

    handleInvestmentClick(event) {
        const investmentId = event.currentTarget.dataset.id;
        
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: investmentId,
                actionName: 'view'
            }
        });
    }

    handleSellClick(event) {
    const investmentId = event.currentTarget.dataset.id;
    const stockSymbol = event.currentTarget.dataset.symbol;
    const purchaseSharePrice = event.currentTarget.dataset.purchase;
    const quantity = event.currentTarget.dataset.quantity;
    const final = event.currentTarget.dataset.final;
    console.log('hello' + event.currentTarget.dataset.final);
    const initial = event.currentTarget.dataset.initial;
    const total = event.currentTarget.dataset.total;
    
    this.showModal = true;
    this.purchaseSharePriceForModal = purchaseSharePrice;
    this.investmentIdForModal = investmentId;
    this.stockSymbolForModal = stockSymbol;
    this.quantityForModal = quantity;
    this.finalForModal = final;
    this.initialForModal = initial;
    this.totalPurchaseForModal = total;

    // }

    // handleCloseModal() {
    //     this.showModal = false;
    //     console.log('did you make it?')
        
    // }
    // handleSuccess() {
    //     this.showModal =false;
    // }

    // handleSell(event) {
    //     this.showModal = false;
    //     console.log('what about you?');
    // }

}
}
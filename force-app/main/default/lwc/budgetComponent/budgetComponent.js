import { LightningElement, wire, api } from 'lwc';
import getBudgetData from '@salesforce/apex/BudgetController.getBudgetData';
import createOrUpdateMonthlyRecords from '@salesforce/apex/BudgetController.createOrUpdateMonthlyRecords';
import USER_ID from '@salesforce/user/Id';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation'; 
import annualprojection from 'c/annualProjectionModal';
export default class BudgetComponent extends NavigationMixin(LightningElement) {
    @api recordId;
    totalMonthlyIncome = 0;
    totalFixedExpenses = 0;
    totalVariableExpenses = 0;
    totalOneTimeExpenses = 0;
    netMonthlyCashFlow = 0;
    wiredBudgetDataResult;
    showModal = false;
    modalType = '';
    modalTitle = '';
    objectApiName = '';

    get isIncomeSource() {
        return this.modalType === 'IncomeSource';
    }

    get cashFlowClass() {
        return this.netMonthlyCashFlow >= 0 ? 'slds-text-color_success final-summary' : 'slds-text-color_error final-summary';
    }
    myFinances;
    @wire(getBudgetData, { userId: USER_ID })
    budgetDataHandler(result) {
        this.wiredBudgetDataResult = result;
        const { data, error } = result;
        if (data) {
            this.totalMonthlyIncome = parseFloat(data.totalMonthlyIncome).toFixed(2);
            this.totalFixedExpenses = parseFloat(data.totalFixedExpenses).toFixed(2);
            this.totalVariableExpenses = parseFloat(data.totalVariableExpenses).toFixed(2);
            this.totalOneTimeExpenses = parseFloat(data.totalOneTimeExpenses).toFixed(2);
            this.netMonthlyCashFlow = parseFloat(data.netMonthlyCashFlow).toFixed(2);
            console.log('data', data);
            this.myFinances = data;
        } else if (error) {
            console.error(error);
        }
    }

    connectedCallback() {
        this.refreshData();
    }

    renderedCallback() {
        this.refreshData();
    }

    refreshData() {
        if (this.wiredBudgetDataResult) {
            refreshApex(this.wiredBudgetDataResult);
        }
    }

    handleAddIncomeSource() {
        this.modalType = 'IncomeSource';
        this.modalTitle = 'Add Income Source';
        this.objectApiName = 'Income_Source__c';
        this.showModal = true;
    }

    handleAddRecurringExpense() {
        this.modalType = 'RecurringExpense';
        this.modalTitle = 'Add Recurring Expense';
        this.objectApiName = 'Recurring_Expense__c';
        this.showModal = true;
    }

    handleCloseModal() {
        this.showModal = false;
    }

    handleRecordSuccess(event) {
        this.showToast('Success', event.detail, 'success');
        this.refreshData();
    }

    handleRecordError(event) {
        this.showToast('Error', event.detail, 'error');
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }
    handleViewIncomeSources() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Income_Source__c',
                actionName: 'list'
            },
            state: {
                filterName: 'All' // Optional: Specify the list view filter name, like 'All' or a custom list view API name.
            }
        });
    }

    handleViewRecurringExpenses() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Recurring_Expense__c',
                actionName: 'list'
            },
            state: {
                filterName: 'All' // Optional: Specify the list view filter name, like 'All' or a custom list view API name.
            }
        });
    }
    // async handleAnnualProjection(){
    //     console.log('in addresses open please');
    //     const result = await annualprojection.open({
    //         label: 'Modal Test',
    //         size: 'medium',
    //         myFinances: this.myFinances
    //     });
    //     console.log(result);
    //     // if modal closed with X or cancel button, promise returns result = 'undefined' need to program when cancel is clicked just do .close() with no arguments
    //     if (!result) {
    //         console.log('result was undefined (X button clicked)');
    //         this[NavigationMixin.Navigate]({
    //             // Pass in pageReference
    //             type: 'standard__namedPage',
    //             attributes: {
    //                 pageName: 'home'
    //             }
    //         });
    //     }
    // }
    async handleAnnualProjection() {
        const currentYear = new Date().getFullYear();
    
        // Use the data from myFinances to populate the first month (January)
        const { totalMonthlyIncome, totalFixedExpenses, totalVariableExpenses, totalOneTimeExpenses, netMonthlyCashFlow } = this.myFinances;
    
        // Create or update records for the current year using myFinances data
        await createOrUpdateMonthlyRecords({
            year: currentYear,
            income: totalMonthlyIncome,
            fixedExpenses: totalFixedExpenses,
            variableExpenses: totalVariableExpenses,
            oneTimeExpenses: totalOneTimeExpenses,
            netCashFlow: netMonthlyCashFlow
        });
    
        // Open the modal to display the records
        const result = await annualprojection.open({
            size: 'medium',
            description: 'View your annual budget projection',
            myFinances: this.myFinances,
            year: currentYear
        });
    
        if (result === 'closed') {
            console.log('Modal was closed');
        }
}
}
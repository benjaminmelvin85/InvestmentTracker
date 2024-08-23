import { LightningElement, wire, api } from 'lwc';
import getBudgetData from '@salesforce/apex/BudgetController.getBudgetData';
import USER_ID from '@salesforce/user/Id';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class BudgetComponent extends LightningElement {
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
}
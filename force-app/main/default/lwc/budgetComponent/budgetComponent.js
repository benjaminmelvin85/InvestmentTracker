import { LightningElement, wire, api, track } from 'lwc';
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

    // Determine which object to use based on the modal type
    get objectApiName() {
        return this.modalType === 'IncomeSource' ? 'Income_Source__c' : 'Recurring_Expense__c';
    }

    get isIncomeSource() {
        return this.modalType === 'IncomeSource';
    }

    // To dynamically control visibility of additional fields
    get isRecurringExpense() {
        return this.modalType === 'RecurringExpense';
    }

    get modalTitle() {
        return this.modalType === 'IncomeSource' ? 'Add Income Source' : 'Add Recurring Expense';
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
        this.showModal = true;
    }

    handleAddRecurringExpense() {
        this.modalType = 'RecurringExpense';
        this.showModal = true;
    }

    handleCloseModal() {
        this.showModal = false;
    }

    handleSuccess() {
        this.showToast('Success', `${this.modalType === 'IncomeSource' ? 'Income Source' : 'Recurring Expense'} created successfully`, 'success');
        this.handleCloseModal();
        this.refreshData();
    }

    handleError(event) {
        this.showToast('Error', `Error creating ${this.modalType === 'IncomeSource' ? 'Income Source' : 'Recurring Expense'}: ${event.detail.message}`, 'error');
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

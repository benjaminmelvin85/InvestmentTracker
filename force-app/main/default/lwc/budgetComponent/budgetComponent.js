import { LightningElement, wire, api } from 'lwc';
import getBudgetData from '@salesforce/apex/BudgetController.getBudgetData';
import createOrUpdateMonthlyRecords from '@salesforce/apex/BudgetController.createOrUpdateMonthlyRecords';
import USER_ID from '@salesforce/user/Id';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation'; 
import annualprojection from 'c/annualProjectionModal';
import reusableModal from 'c/reusableModal';
export default class BudgetComponent extends NavigationMixin(LightningElement) {
    @api recordId;
    totalMonthlyIncome = 0;
    totalFixedExpenses = 0;
    totalVariableExpenses = 0;
    totalOneTimeExpenses = 0;
    netMonthlyCashFlow = 0;
    totalMonthlyContributions = 0;
    savingsBalance = 0;
    checkingBalance = 0;
    wiredBudgetDataResult;
    showModal = false;
    modalType = '';
    modalTitle = '';
    objectApiName = '';
    total401KBalance=0;

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
            this.totalMonthlyContributions = parseFloat(data.totalMonthlyContributions).toFixed(2);
            this.savingsBalance = parseFloat(data.totalSavingsBalance).toFixed(2);
            this.checkingBalance = parseFloat(data.totalCheckingBalance).toFixed(2);
            this.total401KBalance = parseFloat(data.total401KBalance).toFixed(2);
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
        console.log('refreshDataCalled')
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
    async handleViewIncomeSources() {
        const result = await reusableModal.open({
            label: 'testing 1,2,3',
            size: 'medium',
            description: 'View your annual budget projection',
            objectApiName: 'Income_Source__c',
            title: 'Income Sources',
            columns: [
                { label: 'Name', fieldName: 'Income_Name__c', },
                { label: 'Income Amount', fieldName: 'Income_Amount__c'},
                { label: 'Income Frequency', fieldName: 'Income_Frequency__c'},
                { label: 'Income Type', fieldName: 'Income_Type__c'},
                
            ],
            refreshCallback: () => this.refreshData()
        });
    
        if (result === 'refresh') {
            this.refreshData();
            console.log('refresh the Data');
        }
        // this[NavigationMixin.Navigate]({
        //     type: 'standard__objectPage',
        //     attributes: {
        //         objectApiName: 'Income_Source__c',
        //         actionName: 'list'
        //     },
        //     state: {
        //         filterName: 'All' // Optional: Specify the list view filter name, like 'All' or a custom list view API name.
        //     }
        // });
        // console.log('hit button');
        // try{
        // await reusableModal.open({
        //     label: 'test',
        //         size: 'medium',
        //         description: 'View your income sources',
                // objectApiName: 'Income_Source__c',
                // columns: [{
                //     label: 'Name',
                //     fieldName: 'Name',
                 
                    
                // },  ],
                // title: 'Income Sources',
                
        //     })
        // // } catch (error) {
        // //     console.error('your error is', error)
        // // }
        //     console.log('did it make it here?')
            // if (result === 'closed') {
            //     console.log('Modal was closed');
            // }
    }

    async handleViewRecurringExpenses() {
        const result = await reusableModal.open({
            label: 'testing 1,2,3',
            size: 'medium',
            description: 'View your annual budget projection',
            objectApiName: 'Recurring_Expense__c',
            title: 'Recurring Expenses',
            columns: [
                { label: 'Name', fieldName: 'Expense_Name__c', },
                { label: 'Expense Amount', fieldName: 'Expense_Amount__c'},
                { label: 'Expense Frequency', fieldName: 'Expense_Frequency__c'},
                { label: 'Expense Type', fieldName: 'Expense_Type__c'},
                
            ],
            refreshCallback: () => this.refreshData()
        });
    
        if (result === 'closed') {
            console.log('Modal was closed');
        }
        // this[NavigationMixin.Navigate]({
        //     type: 'standard__objectPage',
        //     attributes: {
        //         objectApiName: 'Recurring_Expense__c',
        //         actionName: 'list'
        //     },
        //     state: {
        //         filterName: 'All' // Optional: Specify the list view filter name, like 'All' or a custom list view API name.
        //     }
        // });
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
handleCheckingSavings(){
    this.modalType = 'isChecking';
        this.modalTitle = 'Add Checking or Savings Account';
        this.objectApiName = 'Savings_Checking_Account__c';
        this.showModal = true;
}
async handleViewChecking() {

    //SELECT Account_Name__c, Balance__c, Account_Type__c,Monthly_Contribution__c, Interest_Rate__c
    const result = await reusableModal.open({
        label: 'testing 1,2,3',
        size: 'medium',
        description: 'View your annual budget projection',
        objectApiName: 'Savings_Checking_Account__c',
        title: 'Savings, Checking and 401K Accounts',
        columns: [
            { label: 'Name', fieldName: 'Account_Name__c', },
            { label: 'Balance', fieldName: 'Balance__c'},
            { label: 'Account Type', fieldName: 'Account_Type__c'},
            { label: 'Monthly Contribution', fieldName: 'Monthly_Contribution__c'},
            { label: 'Interest Rate', fieldName: 'Interest_Rate__c', },
            
        ],
        refreshCallback: () => this.refreshData()
    });

    if (result === 'closed') {
        console.log('Modal was closed');
    }
    // this[NavigationMixin.Navigate]({
    //     type: 'standard__objectPage',
    //     attributes: {
    //         objectApiName: 'Savings_Checking_Account__c',
    //         actionName: 'list'
    //     },
    //     state: {
    //         filterName: 'All' // Optional: Specify the list view filter name, like 'All' or a custom list view API name.
    //     }
    // });
}
}
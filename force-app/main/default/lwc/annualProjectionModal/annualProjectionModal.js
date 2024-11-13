import LightningModal from 'lightning/modal';
import { api, track, wire} from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getMonthlyRecords from '@salesforce/apex/BudgetController.getMonthlyRecords';
import updateMonthlyRecord from '@salesforce/apex/BudgetController.updateMonthlyRecord';
import { refreshApex } from '@salesforce/apex';
export default class AnnualProjectionModal extends LightningModal {
    @api myFinances;
    @api year;
    @track monthlyRecords = [];
    @track annualIncome;
    @track annualExpenses;
    @track netCashFlow;
    defaultSortDirection = 'asc';
    sortDirection = 'asc';
    sortedBy;
    @track editable = false;
    @track draftValues = [];
    
    columns = [
        { label: 'Month', fieldName: 'Month__c', },
        { label: 'Income', fieldName: 'Income__c', type: 'number', sortable: true, editable: this.editable},
        { label: 'Fixed Expenses', fieldName: 'Fixed_Expenses__c', type: 'number', sortable: true, editable: this.editable },
        { label: 'Variable Expenses', fieldName: 'Variable_Expenses__c', type: 'number', sortable: true, editable: this.editable },
        { label: 'One-Time Expenses', fieldName: 'One_Time_Expenses__c', type: 'number',sortable: true, editable: this.editable },
        { label: 'Net Cash Flow', fieldName: 'Net_Cash_Flow__c', type: 'number',sortable: true},
        { label: 'Id', fieldName: 'Id', type: 'text', hideDefaultActions: true, editable: false, exclude: true }
    ];

    async connectedCallback() {
        // this.initializeData();
        // await this.loadMonthlyRecords();
    }
    get editButtonLabel() {
        return this.editable ? "Can't Edit Annual Snapshot" : "Edit Annual Snapshot"
    }
    get visibleColumns(){
        return this.columns.filter(column => !column.exclude);
    }
    handleEdit() {
        this.editable = !this.editable;
        this.columns = this.columns.map(col => ({
            ...col,
            editable: this.editable
        }))
    }
    @wire(getMonthlyRecords, { year: '$year' })
    wiredMonthlyRecords(result) {
        this.wiredRecordsResult = result;
        const { data, error } = result;

        if (data) {
            this.monthlyRecords = data.map((record, index) => ({
                ...record,
                rowId: `row-${index}`
            }));
            this.recalculateAnnualTotals();
        } else if (error) {
            console.error('Error fetching monthly records:', error);
            this.showToast('Error', 'Failed to load monthly records.', 'error');
        }
    }
    // initializeData() {
    //     const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    //     let totalIncome = 0, totalExpenses = 0, recordIncome = 0, recordExpenses = 0; 
        
    //     months.forEach((month, index) => {
    //         const record = {
    //             id: index + 1,
    //             month: month,
    //             income: parseFloat(this.myFinances.totalMonthlyIncome).toFixed(2),
    //             fixedExpenses: parseFloat(this.myFinances.totalFixedExpenses).toFixed(2),
    //             variableExpenses: parseFloat(this.myFinances.totalVariableExpenses).toFixed(2),
    //             oneTimeExpenses: this.myFinances.totalOneTimeExpenses,
    //             netCashFlow: this.myFinances.netMonthlyCashFlow
    //         };
    //         recordIncome = parseFloat(record.income).toFixed(2);
    //         console.log('what is it', typeof(recordIncome))
    //         totalIncome += +recordIncome;
    //         console.log('totalI', totalIncome)
    //         recordExpenses = +parseFloat(record.fixedExpenses).toFixed(2) + +parseFloat(record.variableExpenses).toFixed(2) + +parseFloat(record.oneTimeExpenses).toFixed(2);
    //         totalExpenses += +recordExpenses;
    //         console.log('totalE', totalExpenses)
    //         this.monthlyRecords.push(record);
    //     });
        
    //     this.annualIncome = totalIncome
    //     console.log('annual', this.annualIncome)
    //     this.annualExpenses = totalExpenses
    //     console.log('annualE', this.annualExpenses)
    //     this.netCashFlow = totalIncome - totalExpenses;
    //     console.log('netcash', this.netCashFlow)
    // }
    async loadMonthlyRecords() {
        try {
            const records = await getMonthlyRecords({ year: this.year });
            console.log('Records load', records);
            console.log('monthly Records', this.monthlyRecords)
            this.monthlyRecords = records.map((record,index) => ({
                Id: record.Id,
                Month__c: record.Month__c,
                Income__c: parseFloat(record.Income__c || 0).toFixed(2),
                Fixed_Expenses__c: parseFloat(record.Fixed_Expenses__c || 0).toFixed(2),
                Variable_Expenses__c: parseFloat(record.Variable_Expenses__c || 0).toFixed(2),
                One_Time_Expenses__c: parseFloat(record.One_Time_Expenses__c || 0).toFixed(2),
                Net_Cash_Flow__c: record.Net_Cash_Flow__c,
                rowId: `row-${index}`
            }));
            this.recalculateAnnualTotals();
        } catch (error) {
            console.error('Error fetching monthly records:', error);
            this.showToast('Error', 'Failed to load monthly records.', 'error');
        }
    }
    handleClose() {
        this.close('closed');
    }
    sortBy(field, reverse, primer) {
        const key = primer
            ? function (x) {
                  return primer(x[field]);
              }
            : function (x) {
                  return x[field];
              };

        return function (a, b) {
            a = key(a);
            b = key(b);
            return reverse * ((a > b) - (b > a));
        };
    }

    onHandleSort(event) {
        const { fieldName: sortedBy, sortDirection } = event.detail;
        const cloneData = [...this.monthlyRecords];

        cloneData.sort(this.sortBy(sortedBy, sortDirection === 'asc' ? 1 : -1));
        this.monthlyRecords = cloneData;
        this.sortDirection = sortDirection;
        this.sortedBy = sortedBy;
    }
    // handleSave(event) {
    //     const updatedFields = event.detail.draftValues;
    //     console.log('updated fields', updatedFields)
    //     updatedFields.forEach(update => {
    //         // Sanitize input values
    //         if (update.income) {
    //             update.income = parseFloat(update.income).toFixed(2);
    //         }
    //         if (update.fixedExpenses) {
    //             update.fixedExpenses = parseFloat(update.fixedExpenses).toFixed(2);
    //         }
    //         if (update.variableExpenses) {
    //             update.variableExpenses = parseFloat(update.variableExpenses).toFixed(2);
    //         }
    //         if (update.oneTimeExpenses) {
    //             console.log('inside onetime')
    //             update.oneTimeExpenses = parseFloat(update.oneTimeExpenses).toFixed(2);
    //         }
    //         console.log('before record')
    //         console.log('monthlyRecords',this.monthlyRecords)
    //         const record = this.monthlyRecords.find(rec => rec.id === +update.id);
    //         console.log('record', record);
    //         if (record) {
    //             console.log('inside if')
    //             // if (record) {
    //                 if (update.income !== undefined){
    //                     record.income = +parseFloat(update.income).toFixed(2);
    //                 } 
    //                 if (update.fixedExpenses !== undefined) {
    //                     record.fixedExpenses = +parseFloat(update.fixedExpenses).toFixed(2);
    //                 }
    //                 if (update.variableExpenses !== undefined) {
    //                     record.variableExpenses = +parseFloat(update.variableExpenses).toFixed(2);}

    //                 if (update.oneTimeExpenses !== undefined) {
    //                     console.log('inside if expenses')
    //                     record.oneTimeExpenses = +parseFloat(update.oneTimeExpenses).toFixed(2);
    //                 }
    //                 console.log('before update')
    //                 // Recalculate net cash flow
    //                 record.netCashFlow = +record.income - (+record.fixedExpenses + +record.variableExpenses + +record.oneTimeExpenses);
    //             // Recalculate net cash flow
    //             // record.netCashFlow = +record.income - (+record.fixedExpenses + +record.variableExpenses + +record.oneTimeExpenses);
    //             console.log('after update')
    //         }
    //     });
    
    //     this.draftValues = [];
    //     this.recalculateAnnualTotals();
    //     console.log('before toast')
    //     this.showToast('Success', 'Records updated successfully', 'success');
    //     console.log('after toast')
    // }
    async handleSave(event) {
        const updatedFields = event.detail.draftValues;
        let updatedRecord;
        try {
            for (const update of updatedFields) {
                console.log('Draft Value Update:', update);
                
                // Find the corresponding record using rowId
                const record = this.monthlyRecords.find(rec => rec.rowId === update.id);
                
                if (record) {
                     updatedRecord = {
                        Id: record.Id,
                        Income__c: update.Income__c !== undefined ? parseFloat(update.Income__c).toFixed(2) : record.Income__c,
                        Fixed_Expenses__c: update.Fixed_Expenses__c !== undefined ? parseFloat(update.Fixed_Expenses__c).toFixed(2) : record.Fixed_Expenses__c,
                        Variable_Expenses__c: update.Variable_Expenses__c !== undefined ? parseFloat(update.Variable_Expenses__c).toFixed(2) : record.Variable_Expenses__c,
                        One_Time_Expenses__c: update.One_Time_Expenses__c !== undefined ? parseFloat(update.One_Time_Expenses__c).toFixed(2) : record.One_Time_Expenses__c
                    };

                    // Save the updated record to Salesforce
                     await updateMonthlyRecord({ record: updatedRecord });
                }
            }
            console.log('updated Record', updatedRecord)
            // await updateMonthlyRecord({ record: updatedRecord });
            this.draftValues = [];

            // Refresh the records from Salesforce
            await refreshApex(this.wiredRecordsResult);
            // await this.refreshTable();
            this.showToast('Success', 'Records updated successfully', 'success');
        } catch (error) {
            console.error('Error updating records:', error);
            this.showToast('Error', 'Failed to update records.', 'error');
        }
    }
    async refreshTable() {
        try {
            // Fetch the latest data from Salesforce
            const records = await getMonthlyRecords({ year: this.year });
    
            // Update the monthlyRecords array to trigger reactivity
            this.monthlyRecords = records.map((record, index) => ({
                Id: record.Id,
                Month__c: record.Month__c,
                Income__c: parseFloat(record.Income__c || 0).toFixed(2),
                Fixed_Expenses__c: parseFloat(record.Fixed_Expenses__c || 0).toFixed(2),
                Variable_Expenses__c: parseFloat(record.Variable_Expenses__c || 0).toFixed(2),
                One_Time_Expenses__c: parseFloat(record.One_Time_Expenses__c || 0).toFixed(2),
                Net_Cash_Flow__c: parseFloat(record.Net_Cash_Flow__c || 0).toFixed(2),
                rowId: `row-${index}`
            }));
    
            // Force reactivity by assigning a new reference
            this.monthlyRecords = [...this.monthlyRecords];
    
            // Recalculate annual totals
            this.recalculateAnnualTotals();
        } catch (error) {
            console.error('Error refreshing data:', error);
            this.showToast('Error', 'Failed to refresh data.', 'error');
        }
    }
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title,
            message,
            variant
        });
        console.log('before dispatch')
        this.dispatchEvent(event);
        console.log('after Dispatch')
    }
    recalculateAnnualTotals() {
        let totalIncome = 0;
        let totalExpenses = 0;

        this.monthlyRecords.forEach(record => {
            totalIncome += parseFloat(record.Income__c);
            totalExpenses += parseFloat(record.Fixed_Expenses__c) +
                            parseFloat(record.Variable_Expenses__c) +
                            parseFloat(record.One_Time_Expenses__c);
        });

        this.annualIncome = totalIncome.toFixed(2);
        this.annualExpenses = totalExpenses.toFixed(2);
        this.netCashFlow = (totalIncome - totalExpenses).toFixed(2);
}
}
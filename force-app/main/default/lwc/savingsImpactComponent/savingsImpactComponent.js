import { LightningElement } from 'lwc';
import getRecords from '@salesforce/apex/BudgetController.getRecords';
export default class SavingsImpactComponent extends LightningElement {
    balance = 0;
    interestRate = 0;
    contribution = 0;
    years = 0;
    futureBalance;

    handleInputChange(event) {
        const field = event.target.dataset.id;
        this[field] = parseFloat(event.target.value) || 0;
    }

    calculateFutureBalance() {
        const rate = this.interestRates / 100 / 12;
        const months = this.years * 12;
        let futureValue = this.totalBalance;

        for (let i = 0; i < months; i++) {
            futureValue += this.monthlyContributions;
            futureValue += futureValue * rate;
        }

        this.futureBalance = futureValue.toFixed(2);
    }
    value = '';

    get options() {
        return [
            { label: 'Savings', value: 'savings' },
            { label: 'Checking', value: 'checking' },
            { label: '401K', value: '401K' },
        ];
    }

    handleChange(event) {
        this.value = event.detail.value;
        this.setValues(this.value);
    }
    connectedCallback() {
        this.loadRecords();
    }
    allRecords
    async loadRecords() {
        try{
            const records = await getRecords({objectApiName: 'Savings_Checking_Account__c'})
            this.allRecords = records;
            console.log('data/records in savings component', records)
        } catch (error) {
            console.error('your error loading records', error);
        }
        
    }
    totalBalance = 0
    interestRates = 0
    monthlyContributions = 0

    setValues(value) {
        this.totalBalance = 0
        this.interestRates = 0
        this.monthlyContributions = 0
        let recordCount = 0
        if (value === 'checking'){
            let checkingRecords = this.allRecords.filter(item => item.Account_Type__c === 'Checking');
            console.log('checkingRecords', checkingRecords)
            recordCount = checkingRecords.length
            console.log('recordCount',recordCount)
            checkingRecords.forEach(record => {
                console.log('record', record)
                console.log(record.Balance__c)
                console.log(typeof(record.Balance__c))
                this.totalBalance += record.Balance__c
                this.monthlyContributions += record.Monthly_Contribution__c
                this.interestRates += record.Interest_Rate__c
                console.log('interest inside loop', this.interestRates)
            })
            this.interestRates = this.interestRates/recordCount
        }
        if (value === 'savings'){
            let checkingRecords = this.allRecords.filter(item => item.Account_Type__c === 'Savings');
            console.log('checkingRecords', checkingRecords)
            recordCount = checkingRecords.length
            console.log('recordCount',recordCount)
            checkingRecords.forEach(record => {
                console.log('record', record)
                console.log(record.Balance__c)
                console.log(typeof(record.Balance__c))
                this.totalBalance += record.Balance__c
                this.monthlyContributions += record.Monthly_Contribution__c
                
            })
        }
        if (value === '401K'){
            let checkingRecords = this.allRecords.filter(item => item.Account_Type__c === '401K');
            console.log('checkingRecords', checkingRecords)
            recordCount = checkingRecords.length
            console.log('recordCount',recordCount)
            checkingRecords.forEach(record => {
                console.log('record', record)
                console.log(record.Balance__c)
                console.log(typeof(record.Balance__c))
                this.totalBalance += record.Balance__c
                this.monthlyContributions += record.Monthly_Contribution__c
                
            })
        }
    }
}
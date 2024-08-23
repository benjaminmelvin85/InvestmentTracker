import { LightningElement } from 'lwc';

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
        const rate = this.interestRate / 100 / 12;
        const months = this.years * 12;
        let futureValue = this.balance;

        for (let i = 0; i < months; i++) {
            futureValue += this.contribution;
            futureValue += futureValue * rate;
        }

        this.futureBalance = futureValue.toFixed(2);
    }
}

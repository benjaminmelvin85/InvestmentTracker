import { LightningElement } from 'lwc';

export default class LoanImpactComponent extends LightningElement {
    loanBalance = 0;
    interestRate = 0;
    monthlyPayment = 0;
    extraPayment = 0;
    result;

    handleInputChange(event) {
        const field = event.target.dataset.id;
        this[field] = parseFloat(event.target.value) || 0;
    }

    calculateLoanImpact() {
        const rate = this.interestRate / 100 / 12;
        let balance = this.loanBalance;
        let totalInterestPaid = 0;
        let months = 0;

        while (balance > 0) {
            const interestForMonth = balance * rate;
            totalInterestPaid += interestForMonth;
            const principalPaid = this.monthlyPayment + this.extraPayment - interestForMonth;
            balance -= principalPaid;
            months += 1;

            if (balance <= 0) {
                balance = 0;
            }
        }

        const originalMonths = Math.ceil(Math.log(this.monthlyPayment / (this.monthlyPayment - balance * rate)) / Math.log(1 + rate));
        const originalInterest = originalMonths * this.monthlyPayment - this.loanBalance;

        this.result = {
            newPayoffTime: months,
            totalInterestSaved: (originalInterest - totalInterestPaid).toFixed(2),
        };
    }
}

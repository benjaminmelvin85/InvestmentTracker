import { LightningElement, track } from 'lwc';

export default class InvestmentCalculator extends LightningElement {
  @track initialInvestmentAmount = 0;
  @track annualContribution = 0;
  @track timeHorizon = 0;
  @track rateOfReturn = 0;
  @track showResults = false;
  @track futureValue = 0;

  handleInitialAmountChange(event) {
    this.initialInvestmentAmount = parseFloat(event.target.value);
  }

  handleAnnualContributionChange(event) {
    this.annualContribution = parseFloat(event.target.value);
  }

  handleTimeChange(event) {
    this.timeHorizon = parseFloat(event.target.value);
  }

  handleRateChange(event) {
    this.rateOfReturn = parseFloat(event.target.value);
  }

  calculate() {
    const totalContributions = this.annualContribution * this.timeHorizon;
    const futureValue = this.initialInvestmentAmount * Math.pow((1 + this.rateOfReturn / 100), this.timeHorizon);
    this.futureValue = (futureValue + totalContributions).toFixed(2);
    this.showResults = true;
  }
}
import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class BudgetRecordModal extends LightningElement {
    @api showModal = false;
    @api modalTitle;
    @api objectApiName;
    @api modalType;

    // Determine which fields to show based on the modal type
    get isIncomeSource() {
        return this.modalType === 'IncomeSource';
    }

    get isRecurringExpense() {
        return this.modalType === 'RecurringExpense';
    }

    handleCloseModal() {
        const closeEvent = new CustomEvent('closemodal');
        this.dispatchEvent(closeEvent);
    }

    handleSuccess() {
        const successEvent = new CustomEvent('recordsuccess', {
            detail: `${this.modalType} created successfully`,
        });
        this.dispatchEvent(successEvent);
        this.handleCloseModal();
    }

    handleError(event) {
        const errorEvent = new CustomEvent('recorderror', {
            detail: `Error creating ${this.modalType}: ${event.detail.message}`,
        });
        this.dispatchEvent(errorEvent);
    }
}
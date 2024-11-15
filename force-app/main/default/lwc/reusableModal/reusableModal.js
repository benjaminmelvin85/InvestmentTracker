import LightningModal from 'lightning/modal';
import { api, track } from 'lwc';
import getRecords from '@salesforce/apex/BudgetController.getRecords';
import {updateRecord} from 'lightning/uiRecordApi'
export default class ReusableModal extends LightningModal {
@api objectApiName;
@track data = [];
@api columns;
@api title;
@api refreshCallback;
@track editable = false;
@track draftValues = [];
@track myColumns;
connectedCallback() {
    console.log('columns', this.columns)
    console.log('connected')
    this.myColumns = this.columns;
    this.loadRecords();

}
async loadRecords() {
    try{
        const records = await getRecords({objectApiName: this.objectApiName})
        this.data = records;
        console.log('data/records', this.data)
    } catch (error) {
        console.error('your error loading records', error);
    }
    
}
handleEdit() {
    this.editable = !this.editable;
    this.myColumns = this.columns.map(col => ({
        ...col,
        editable: this.editable
    }))
}
async handleSave(event) {
    const updatedFields  = event.detail.draftValues;
    console.log('updatedFields', updatedFields)
    const updatePromises = updatedFields.map(record => {
        const fields = {Id: record.Id};
        Object.keys(record).forEach(key => {
            fields[key] = record[key]
        })
        return updateRecord({fields})
        })
    try {
        await Promise.all(updatePromises);
        console.log('need to add success toast')
        this.draftValues = [];
        this.editable = false;
        this.loadRecords();
        console.log('before Dispatch')
        if(this.refreshCallback) {
            this.refreshCallback();
        
        }
        console.log('after Dispatch')
    } catch (error) {
        console.error('error updating records', error);
    }
}
}
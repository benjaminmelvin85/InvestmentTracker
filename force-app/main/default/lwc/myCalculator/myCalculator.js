import { LightningElement } from 'lwc';

export default class Calculator extends LightningElement {
result = '';

handleClick(event) {
this.result = this.result.concat(event.target.value);
}

clear() {
this.result = '';
}

calculate() {
try {
this.result = eval(this.result);
} catch (error) {
this.result = 'Error';
}
}
}
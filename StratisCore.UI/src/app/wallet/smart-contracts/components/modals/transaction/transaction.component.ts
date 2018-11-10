import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, Validators, FormBuilder, AbstractControl, FormControl } from '@angular/forms';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { GlobalService } from '../../../../../shared/services/global.service';
import { SmartContractsServiceBase } from '../../../smart-contracts.service';
import { Observable } from 'rxjs';

export enum Mode { Call, Create }
export class Parameter {
    constructor(public type: string, public value: string) {}
}

@Component({
    selector: 'app-transaction',
    templateUrl: './transaction.component.html',
    styleUrls: ['./transaction.component.css']
})
export class TransactionComponent implements OnInit {

    constructor(private globalService: GlobalService, private smartContractsService: SmartContractsServiceBase,
                    private activeModal: NgbActiveModal, private formBuilder: FormBuilder) { }

    modeEnum = Mode;
    transactionForm: FormGroup;
    parameterTypes: string[] = [];
    parameters: Parameter[] = [];
    selectedSenderAddress = '';
    balance = 0;
    amount: FormControl;
    gasPrice: FormControl;
    gasLimit: FormControl;
    methodName: FormControl;
    destinationAddress: FormControl;
    byteCode: FormControl;
    coinUnit: string;
    @Input() mode: Mode;

    get title(): string { return `${this.prefixText} Transaction`; }
    get buttonText(): string { return `${this.prefixText} transaction`; }

    ngOnInit() {
        this.registerControls();
        const walletName = this.globalService.getWalletName();
    }

    closeClicked() {
        this.activeModal.close();
    }

    addParameterClicked() {
        const defaultType = this.parameterTypes.length ? this.parameterTypes[0] : '';
        this.parameters.push(new Parameter(defaultType, ''));
    }

    removeParameterClicked(parameter: Parameter) {
        const index = this.parameters.findIndex(x => x === parameter);
        if (index >= 0) {
            this.parameters.splice(index, 1);
        }
    }
    
    onSubmit()
    {
        console.log("Submit");
    }

    private get prefixText(): string {
        return this.mode === Mode.Call ? "Call" : "Create";
    }

    private registerControls() {
        const limitAmount = control => Number(control.value) > this.balance ? { amountError: true } : null;

        const integerValidator = Validators.pattern('^[1-9][0-9]*$');
        
        this.amount = new FormControl('', [Validators.required, integerValidator, limitAmount]);
        this.gasPrice = new FormControl('', [Validators.required, integerValidator, Validators.pattern('^[+]?([0-9]{0,})*[.]?([0-9]{0,2})?$')]);
        this.gasLimit = new FormControl('', [Validators.required, integerValidator, Validators.pattern('^[+]?([0-9]{0,})*[.]?([0-9]{0,2})?$')]);
        this.methodName = new FormControl('', [Validators.required, Validators.nullValidator]);
        this.byteCode = new FormControl('', [Validators.required, Validators.nullValidator]);

        if (this.mode === Mode.Call) {
            this.destinationAddress = new FormControl('', [Validators.required, Validators.nullValidator]);

            this.transactionForm = new FormGroup({
                amount: this.amount,
                gasPrice: this.gasPrice,
                gasLimit: this.gasLimit,
                methodName: this.methodName,
                destinationAddress: this.destinationAddress
            });
        }
        else {
            this.transactionForm = new FormGroup({
                amount: this.amount,
                gasPrice: this.gasPrice,
                gasLimit: this.gasLimit,
                byteCode: this.byteCode
            });
        }
    }
}

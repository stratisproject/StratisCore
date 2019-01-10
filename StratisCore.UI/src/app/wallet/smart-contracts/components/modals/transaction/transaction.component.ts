import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, Validators, FormBuilder, AbstractControl, FormControl, FormArray } from '@angular/forms';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { GlobalService } from '../../../../../shared/services/global.service';
import { SmartContractsServiceBase } from '../../../smart-contracts.service';
import { Observable } from 'rxjs';

export enum Mode { Call, Create }
export class Parameter {
    constructor(public type: number, public value: string) {}
}

@Component({
    selector: 'app-transaction',
    templateUrl: './transaction.component.html',
    styleUrls: ['./transaction.component.css']
})
export class TransactionComponent implements OnInit {
    walletName: string;

    constructor(private globalService: GlobalService, private smartContractsService: SmartContractsServiceBase,
                    private activeModal: NgbActiveModal, private formBuilder: FormBuilder) { }

    modeEnum = Mode;
    transactionForm: FormGroup;
    parameterTypes: Parameter[] = [
        new Parameter(1, 'Bool'),
        new Parameter(2, 'Byte'),
        new Parameter(3, 'Char'),
        new Parameter(4, 'String'),
        new Parameter(5, 'UInt'),
        new Parameter(6, 'Int'),
        new Parameter(7, 'ULong'),
        new Parameter(8, 'Long'),
        new Parameter(9, 'Address'),
        new Parameter(10, 'Byte Array')
    ];
    parameters: FormArray;
    selectedSenderAddress = '';
    balance = 0;
    amount: FormControl;
    feeAmount: FormControl;
    gasPrice: FormControl;
    gasLimit: FormControl;
    methodName: FormControl;
    contractAddress: FormControl;
    contractCode: FormControl;
    password: FormControl;
    coinUnit: string;
    loading: boolean;
    @Input() mode: Mode;
    apiError: string;

    gasCallLimitMinimum = 10000;
    gasCreateLimitMinimum = 12000;
    gasLimitMaximum = 100000;
    gasPriceMinimum = 1;
    gasPriceMaximum = 10000;

    get title(): string { return `${this.prefixText} Transaction`; }
    get buttonText(): string { return `${this.prefixText} transaction`; }

    ngOnInit() {
        this.registerControls();
        this.walletName = this.globalService.getWalletName();
    }

    closeClicked() {
        this.activeModal.close();
    }

    addParameterClicked() {
        this.parameters.push(this.createParameter());
    }

    createParameter() : FormGroup {
        const defaultType = this.parameterTypes.length ? this.parameterTypes[0].type : 1;

        return this.formBuilder.group({
            type: defaultType,
            value: ''
        });
    }

    removeParameterClicked(index: number) {
        this.parameters.removeAt(index);
    }

    onSubmit()
    {
        // Hack the parameters into a format the API expects
        let result =  {
            ...this.transactionForm.value,
            parameters: this.transactionForm.value.parameters.map(p => p.type + "#" + p.value),
            walletName: this.walletName,
            sender: this.selectedSenderAddress
        };

        this.loading = true;

        // We don't need an observable here so let's treat it as a promise.
        (this.mode == Mode.Create
            ? this.smartContractsService.PostCreate(result)
            : this.smartContractsService.PostCall(result))
            .toPromise()
            .then(result => {
                this.loading = false;
                this.activeModal.close();
            },
            error => {
                this.loading = false;
                if (!error.errors) {
                    if (error.value.message) {
                        this.apiError = error.value.message;
                    }
                    else {
                        console.log(error);
                    }
                  }
                  else {
                    this.apiError = error.errors[0] .message;
                  }
            });
    }

    private get prefixText(): string {
        return this.mode === Mode.Call ? "Call" : "Create";
    }

    private registerControls() {
        const amountValidator = control => Number(control.value) > this.balance ? { amountError: true } : null;
        const gasPriceTooLowValidator = control => Number(control.value) < this.gasPriceMinimum ? { gasPriceTooLowError: true } : null;
        const gasPriceTooHighValidator = control => Number(control.value) > this.gasPriceMaximum  ? { gasPriceTooHighError: true } : null;
        const gasLimitMaximumValidator = control => Number(control.value) > this.gasLimitMaximum  ? { gasLimitTooHighError: true } : null;
        const gasCallLimitMinimumValidator = control => Number(control.value) < this.gasCallLimitMinimum  ? { gasCallLimitTooLowError: true } : null;
        const gasCreateLimitMinimumValidator = control => Number(control.value) < this.gasCreateLimitMinimum ? { gasCreateLimitTooLowError: true } : null;
        const oddValidator = control => String(control.value).length % 2 !== 0 ? { hasOddNumberOfCharacters: true } : null;

        const integerValidator = Validators.pattern('^[0-9][0-9]*$');

        let gasLimitValidator = (this.mode === Mode.Call ? gasCallLimitMinimumValidator : gasCreateLimitMinimumValidator);

        this.amount = new FormControl(0, [amountValidator]);
        this.feeAmount = new FormControl(0.001, [Validators.required, amountValidator]);
        this.gasPrice = new FormControl(1, [Validators.required, integerValidator, Validators.pattern('^[+]?([0-9]{0,})*[.]?([0-9]{0,2})?$'), gasPriceTooLowValidator, gasPriceTooHighValidator]);
        this.gasLimit = new FormControl(this.mode === Mode.Call ? this.gasCallLimitMinimum : this.gasCreateLimitMinimum, [Validators.required, integerValidator, Validators.pattern('^[+]?([0-9]{0,})*[.]?([0-9]{0,2})?$'), gasLimitValidator, gasLimitMaximumValidator]);
        this.methodName = new FormControl('', [Validators.required, Validators.nullValidator]);
        this.contractCode = new FormControl('', [Validators.required, Validators.nullValidator, Validators.pattern('[0-9a-fA-F]*'), oddValidator]);
        this.parameters = new FormArray([]);
        this.password = new FormControl('', [Validators.required, Validators.nullValidator]);

        if (this.mode === Mode.Call) {
            this.contractAddress = new FormControl('', [Validators.required, Validators.nullValidator]);

            this.transactionForm = new FormGroup({
                amount: this.amount,
                feeAmount: this.feeAmount,
                gasPrice: this.gasPrice,
                gasLimit: this.gasLimit,
                parameters: this.parameters,
                methodName: this.methodName,
                contractAddress: this.contractAddress,
                password: this.password
            });
        }
        else {
            this.transactionForm = new FormGroup({
                amount: this.amount,
                feeAmount: this.feeAmount,
                gasPrice: this.gasPrice,
                gasLimit: this.gasLimit,
                parameters: this.parameters,
                contractCode: this.contractCode,
                password: this.password
            });
        }
    }
}

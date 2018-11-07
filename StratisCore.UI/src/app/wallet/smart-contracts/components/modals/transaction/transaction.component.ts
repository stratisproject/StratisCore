import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, Validators, FormBuilder, AbstractControl } from '@angular/forms';

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
    private balanceNumber: number;

    constructor(private globalService: GlobalService, private smartContractsService: SmartContractsServiceBase,
                    private activeModal: NgbActiveModal, private formBuilder: FormBuilder) { }

    modeEnum = Mode;
    theFormGroup: FormGroup;
    senderAddresses: string[] = [];
    parameterTypes: string[] = [];
    parameters: Parameter[] = [];
    selectedSenderAddress = '';
    balance = '';
    amount = '';
    gasPrice = '';
    gasLimit = '';
    methodName = '';
    destinationAddress = '';
    byteCode = '';
    @Input() mode: Mode;

    get title(): string { return `${this.prefixText} Transaction`; }
    get buttonText(): string { return `${this.prefixText} transaction`; }
    get amountControl(): AbstractControl { return this.theFormGroup.get('amountControl'); }
    get gasPriceControl(): AbstractControl { return this.theFormGroup.get('gasPriceControl'); }
    get gasLimitControl(): AbstractControl { return this.theFormGroup.get('gasLimitControl'); }
    get isValid(): boolean { return (this.amount && this.gasPrice && this.gasLimit && this.methodName && this.destinationAddress) ? true : false; }

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

    private get prefixText(): string {
        return this.mode === Mode.Call ? "Call" : "Create";
    }

    private registerControls() {
        const limitAmount = control => Number(control.value) > this.balanceNumber ? { amountError: true } : null;

        const integerValidator = Validators.pattern('^[1-9][0-9]*$');
        this.theFormGroup = this.formBuilder.group({
            amountControl: ['', [integerValidator, limitAmount]],
            gasPriceControl: ['', [Validators.pattern('^[+]?([0-9]{0,})*[.]?([0-9]{0,2})?$')]],
            gasLimitControl: ['', [integerValidator]]
        });

        TransactionComponent.watchControl<string>(this.amountControl).subscribe(x => this.amount = x);
        TransactionComponent.watchControl<string>(this.gasPriceControl).subscribe(x => this.gasPrice = x);
        TransactionComponent.watchControl<string>(this.gasLimitControl).subscribe(x => this.gasLimit = x);
    }

    private static watchControl<T>(control: AbstractControl): Observable<T> {
        return new Observable(x => {
            var validValue: T;
            control.valueChanges.subscribe(_ => {
                if (control.invalid) {
                    control.setValue(validValue);
                } else {
                    validValue = control.value;
                    x.next(validValue);
                }
            });
        });
    }
}

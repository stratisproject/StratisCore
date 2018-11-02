import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder, AbstractControl } from '@angular/forms';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { GlobalService } from '../../../../../shared/services/global.service';
import { SmartContractsServiceBase } from '../../../smart-contracts.service';
import { Observable } from 'rxjs';

export class Parameter {
    constructor(public type: string, public value: string) {}
}

@Component({
    selector: 'app-call-transaction',
    templateUrl: './call-transaction.component.html',
    styleUrls: ['./call-transaction.component.css']
})
export class CallTransactionComponent implements OnInit {

    constructor(private globalService: GlobalService, private smartContractsService: SmartContractsServiceBase,
                    private activeModal: NgbActiveModal, private formBuilder: FormBuilder) { }

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

    get amountControl(): AbstractControl { return this.theFormGroup.get('amountControl'); }
    get gasPriceControl(): AbstractControl { return this.theFormGroup.get('gasPriceControl'); }
    get gasLimitControl(): AbstractControl { return this.theFormGroup.get('gasLimitControl'); }

    get isValid(): boolean {
        if (this.amount && this.gasPrice && this.gasLimit && this.methodName && this.destinationAddress) {
            return true;
        }
        return false;
    }

    ngOnInit() {
        this.registerControls();

        const walletName = this.globalService.getWalletName();
        this.smartContractsService.GetSenderAddresses(walletName).subscribe(x => {
            this.senderAddresses = x;
            if (this.senderAddresses.length) {
                this.selectedSenderAddress = this.senderAddresses[0];
            }
        });
        this.smartContractsService.GetBalance(walletName).subscribe(x => this.balance = x.toLocaleString());
        this.smartContractsService.GetParameterTypes(walletName).subscribe(x => this.parameterTypes = x);
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
            console.log(index);
        }
    }

    private registerControls() {
        const integerValidator = Validators.pattern('^[1-9][0-9]*$');
        this.theFormGroup = this.formBuilder.group({
            amountControl: ['', [integerValidator]],
            gasPriceControl: ['', [Validators.pattern('^[+]?([0-9]{0,})*[.]?([0-9]{0,2})?$')]],
            gasLimitControl: ['', [integerValidator]]
        });
        CallTransactionComponent.watchControl<string>(this.amountControl).subscribe(x => this.amount = x);
        CallTransactionComponent.watchControl<string>(this.gasPriceControl).subscribe(x => this.gasPrice = x);
        CallTransactionComponent.watchControl<string>(this.gasLimitControl).subscribe(x => this.gasLimit = x);
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

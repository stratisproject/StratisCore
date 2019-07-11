import { Component, OnInit, Input } from '@angular/core';
import { Token } from '@angular/compiler';
import { SavedToken } from '../../models/token';
import { FormControl, FormArray, Validators, FormGroup } from '@angular/forms';
import { Mode } from 'src/app/wallet/smart-contracts/components/modals/transaction/transaction.component';
import { Mixin } from '../../models/mixin';
import { Disposable } from '../../models/disposable';
import { TokensService } from '../../services/tokens.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalService } from '@shared/services/modal.service';

@Component({
  selector: 'app-send-token',
  templateUrl: './send-token.component.html',
  styleUrls: ['./send-token.component.css']
})
@Mixin([Disposable])
export class SendTokenComponent implements OnInit {
  
  @Input()
  selectedSenderAddress: string;

  @Input()
  token: SavedToken;

  balance = 0;

  title = 'Send Token';
  
  parameters: FormArray;
  amount: FormControl;
  feeAmount: FormControl;
  gasPrice: FormControl;
  gasLimit: FormControl;
  methodName: FormControl;
  contractAddress: FormControl;
  recipientAddress: FormControl;
  password: FormControl;
  coinUnit: string;
  loading: boolean;
  apiError: string;

  gasCallLimitMinimum = 10000;
  gasCreateLimitMinimum = 12000;
  gasLimitMaximum = 100000;
  gasPriceMinimum = 1;
  gasPriceMaximum = 10000;
  transactionForm: any;
  tokenAmount: FormControl;

  constructor(private tokenService: TokensService,
    private activeModal: NgbActiveModal,
    private genericModalService: ModalService) {   
    }

  ngOnInit() {    
    this.registerControls();
    this.contractAddress.setValue(this.token.hash);
    this.contractAddress.disable();
    
    this.methodName.setValue("TransferTo");
    this.methodName.disable();
  }

  closeClicked() {
    this.activeModal.close();
  }

  private registerControls() {
    const amountValidator = control => Number(control.value) > this.balance ? { amountError: true } : null;
    const gasPriceTooLowValidator = control => Number(control.value) < this.gasPriceMinimum ? { gasPriceTooLowError: true } : null;
    const gasPriceTooHighValidator = control => Number(control.value) > this.gasPriceMaximum ? { gasPriceTooHighError: true } : null;
    const gasLimitMaximumValidator = control => Number(control.value) > this.gasLimitMaximum ? { gasLimitTooHighError: true } : null;
    const gasCallLimitMinimumValidator = control => Number(control.value) < this.gasCallLimitMinimum ? { gasCallLimitTooLowError: true } : null;
    const gasCreateLimitMinimumValidator = control => Number(control.value) < this.gasCreateLimitMinimum ? { gasCreateLimitTooLowError: true } : null;
    const oddValidator = control => String(control.value).length % 2 !== 0 ? { hasOddNumberOfCharacters: true } : null;

    const integerValidator = Validators.pattern('^[0-9][0-9]*$');

    let gasLimitValidator = (gasCallLimitMinimumValidator);

    this.amount = new FormControl(0, [amountValidator, Validators.min(0)]);
    this.tokenAmount = new FormControl(0, [Validators.min(0)]);
    this.feeAmount = new FormControl(0.001, [Validators.required, amountValidator, Validators.min(0)]);
    this.gasPrice = new FormControl(100, [Validators.required, integerValidator, Validators.pattern('^[+]?([0-9]{0,})*[.]?([0-9]{0,2})?$'), gasPriceTooLowValidator, gasPriceTooHighValidator, Validators.min(0)]);
    this.gasLimit = new FormControl(this.gasCallLimitMinimum, [Validators.required, integerValidator, Validators.pattern('^[+]?([0-9]{0,})*[.]?([0-9]{0,2})?$'), gasLimitValidator, gasLimitMaximumValidator, Validators.min(0)]);
    this.methodName = new FormControl('', [Validators.required, Validators.nullValidator]);
    this.parameters = new FormArray([]);
    this.password = new FormControl('', [Validators.required, Validators.nullValidator]);
    this.contractAddress = new FormControl('', [Validators.required, Validators.nullValidator]);
    this.recipientAddress = new FormControl('', [Validators.required, Validators.nullValidator]);
    this.transactionForm = new FormGroup({
      amount: this.amount,
      feeAmount: this.feeAmount,
      gasPrice: this.gasPrice,
      gasLimit: this.gasLimit,
      parameters: this.parameters,
      tokenAmount: this.tokenAmount,
      methodName: this.methodName,
      contractAddress: this.contractAddress,
      recipientAddress: this.recipientAddress,
      password: this.password
    });
  }
}

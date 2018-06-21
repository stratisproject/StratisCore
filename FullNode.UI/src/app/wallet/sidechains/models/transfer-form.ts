import { BaseForm } from '../../../shared/components/base-form';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { TransactionBuilding } from '../../../shared/classes/transaction-building';
import { Subscription } from 'rxjs/Subscription';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { ApiService } from '../../../shared/services/api.service';
import { GlobalService } from '../../../shared/services/global.service';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalService } from '../../../shared/services/modal.service';
import { CoinNotationPipe } from '../../../shared/pipes/coin-notation.pipe';
import { FeeEstimation } from '../../../shared/classes/fee-estimation';
import { TransactionSending } from '../../../shared/classes/transaction-sending';
import { WalletInfo } from '../../../shared/classes/wallet-info';
import { SendConfirmationComponent } from '../../send/send-confirmation/send-confirmation.component';
import { Log } from '../../../shared/services/logger.service';
import 'rxjs/add/operator/takeUntil';

export class SideChainTransferForm extends BaseForm {
  public mainForm: FormGroup;
  public coinUnit: string;
  public isBusy = false;
  public estimatedFee = 0;
  public totalBalance = 0;
  public apiError: string;

  protected transactionHex: string;
  protected responseMessage: any;
  protected errorMessage: string;
  protected transaction: TransactionBuilding;
  protected walletBalanceSubscription: Subscription;

  private _apiService: ApiService;
  private _globalService: GlobalService;
  private _modalService: NgbModal;
  private _genericModalService: ModalService;
  private _activeModal: NgbActiveModal;
  private _fb: FormBuilder;
  private _log: Log;
  private fromAddressKey: 'mainchainAddress' | 'sidechainAddress';
  private destroyed$ = new ReplaySubject<any>();

  constructor(
    apiService: ApiService,
    globalService: GlobalService,
    modalService: NgbModal,
    genericModalService: ModalService,
    activeModal: NgbActiveModal,
    fb: FormBuilder,
    log: Log,
    fromAddressKey: 'mainchainAddress' | 'sidechainAddress') {
    super();
    this._apiService = apiService;
    this._globalService = globalService;
    this._modalService = modalService;
    this._genericModalService = genericModalService;
    this._activeModal = activeModal;
    this._fb = fb;
    this._log = log;
    this.fromAddressKey = fromAddressKey;
  }

  formErrors = {
    'mainchainAddress': '',
    'sidechainAddress': '',
    'amount': '',
    'feeType': '',
    'password': ''
  };

  validationMessages = {
    'mainchainAddress': {
      'required': 'A mainchain federation address is required.',
      'minlength': 'A mainchain federation address is at least 26 characters long.'
    },
    'sidechainAddress': {
      'required': 'A sidechain federation is required.',
      'minlength': 'A sidechain federation is at least 26 characters long.'
    },
    'amount': {
      'required': 'An amount is required.',
      'pattern': 'Enter a valid transaction amount. Only positive numbers and no more than 8 decimals are allowed.',
      'min': `The amount has to be more or equal to 0.00001.`,
      'max': 'The total transaction amount exceeds your available balance.'
    },
    'feeType': {
      'required': 'A fee is required.'
    },
    'password': {
      'required': 'Your password is required.'
    }
  };

  protected buildForm(): void {
    this.mainForm = this._fb.group({
      'mainchainAddress': [
        this.fromAddressKey === 'mainchainAddress' && this._globalService.federationAddressAutoPopulationEnabled
            ? this._globalService.federationAddress
          : '',
        Validators.compose([Validators.required, Validators.minLength(26)])
      ],
      'sidechainAddress': [
        this.fromAddressKey === 'sidechainAddress' && this._globalService.federationAddressAutoPopulationEnabled
            ? this._globalService.federationAddress
            : '',
        Validators.compose([Validators.required, Validators.minLength(26)])
      ],
      'amount': [
        '',
        Validators.compose([
          Validators.required, Validators.pattern(/^([0-9]+)?(\.[0-9]{0,8})?$/),
          Validators.min(0.00001),
          (control: AbstractControl) => Validators.max((this.totalBalance - this.estimatedFee) / 100000000)(control)])
      ],
      'feeType': ['medium', Validators.required],
      'password': ['', Validators.required]
    });

    this.mainForm.valueChanges
      .takeUntil(this.destroyed$)
      .debounceTime(300)
      .subscribe(data => this.onValueChanged(data));

    this.mainForm.get('feeType').valueChanges
      .takeUntil(this.destroyed$)
      .subscribe((feeType: string) => {
        if (this.mainForm.get(this.fromAddressKey).valid && this.mainForm.get('amount').valid) {
          this.estimateFee();
        }
      }
    );
  }

  onValueChanged(data?: any) {
    if (!this.mainForm) { return; }
    const form = this.mainForm;
    this.validateControls(form, this.formErrors, this.validationMessages);

    this.apiError = '';

    if (this.mainForm.get(this.fromAddressKey).valid && this.mainForm.get('amount').valid) {
      this.estimateFee();
    }
  }

  public getMaxBalance() {
    const data = {
      walletName: this._globalService.walletName,
      feeType: this.mainForm.get('feeType').value
    };

    let balanceResponse;

    this._apiService
      .getMaximumBalance(data)
      .takeUntil(this.destroyed$)
      .subscribe(
        response => {
          if (response.status >= 200 && response.status < 400) {
            balanceResponse = response.json();
          }
        },
        error => {
          this._log.error(error);
          if (error.status === 0) {
            this.apiError = 'Failed to get maximum balance. Reason: API is not responding or timing out.';
          } else if (error.status >= 400) {
            if (!error.json().errors[0]) {
              this._log.error(error);
            } else {
              this.apiError = error.json().errors[0].message;
            }
          }
        },
        () => {
          this.mainForm.patchValue({amount: +new CoinNotationPipe(this._globalService).transform(balanceResponse.maxSpendableAmount)});
          this.estimatedFee = balanceResponse.fee;
        }
      );
  }

  public estimateFee() {
    const transaction = new FeeEstimation(
      this._globalService.walletName,
      'account 0',
      this.mainForm.get(this.fromAddressKey).value.trim(),
      this.mainForm.get('amount').value,
      this.mainForm.get('feeType').value,
      true
    );

    this._apiService.estimateFee(transaction)
      .takeUntil(this.destroyed$)
      .subscribe(
        response => {
          if (response.status >= 200 && response.status < 400) {
            this.responseMessage = response.json();
          }
        },
        error => {
          this._log.error(error);
          if (error.status === 0) {
            this._genericModalService.openModal(null, null);
          } else if (error.status >= 400) {
            if (!error.json().errors[0]) {
              this._log.error(error);
            } else {
              this.apiError = error.json().errors[0].message;
            }
          }
        },
        () => {
          this.estimatedFee = this.responseMessage;
        }
      )
    ;
  }

  public buildTransaction() {
    const toAddressKey = this.fromAddressKey === 'sidechainAddress' ? 'mainchainAddress' : 'sidechainAddress';
    this.transaction = new TransactionBuilding(
      this._globalService.walletName,
      'account 0',
      this.mainForm.get('password').value,
      this.mainForm.get(this.fromAddressKey).value.trim(),
      this.mainForm.get('amount').value,
      this.mainForm.get('feeType').value,
      // TO DO: use coin notation
      this.estimatedFee / 100000000,
      true,
      false,
      this.mainForm.get(toAddressKey).value
    );

    this._apiService
      .buildTransaction(this.transaction)
      .takeUntil(this.destroyed$)
      .subscribe(
        response => {
          if (response.status >= 200 && response.status < 400) {
            this._log.info(response);
            this.responseMessage = response.json();
          }
        },
        error => {
          this._log.error(error);
          this.isBusy = false;
          if (error.status === 0) {
            this.apiError = 'Failed to build transaction. Reason: API is not responding or timing out.';
          } else if (error.status >= 400) {
            if (!error.json().errors[0]) {
              this._log.error(error);
            } else {
              this.apiError = error.json().errors[0].message;
            }
          }
        },
        () => {
          this.estimatedFee = this.responseMessage.fee;
          this.transactionHex = this.responseMessage.hex;
          if (this.isBusy) {
            this.sendTransaction(this.transactionHex);
          }
        }
      )
    ;
  }

  public send() {
    this.isBusy = true;
    this.buildTransaction();
  }

  private sendTransaction(hex: string) {
    const transaction = new TransactionSending(hex);
    this._apiService
      .sendTransaction(transaction)
      .takeUntil(this.destroyed$)
      .subscribe(
        response => {
          if (response.status >= 200 && response.status < 400) {
            this._activeModal.close('Close clicked');
          }
        },
        error => {
          this._log.error(error);
          this.isBusy = false;
          if (error.status === 0) {
            this.apiError = 'Failed to send transaction. Reason: API is not responding or timing out.';
          } else if (error.status >= 400) {
            if (!error.json().errors[0]) {
              this._log.error(error);
            } else {
              this.apiError = error.json().errors[0].message;
            }
          }
        },
        () => this.openConfirmationModal()
      )
    ;
  }

  private getWalletBalance() {
    const walletInfo = new WalletInfo(this._globalService.walletName);
    this.walletBalanceSubscription = this._apiService.getWalletBalance(walletInfo)
      .subscribe(
        response =>  {
          if (response.status >= 200 && response.status < 400) {
              const balanceResponse = response.json();
              this.totalBalance = balanceResponse.balances[0].amountConfirmed + balanceResponse.balances[0].amountUnconfirmed;
          }
        },
        error => {
          this._log.error(error);
          if (error.status === 0) {
            this.cancelSubscriptions();
            this._genericModalService.openModal(null, 'Failed to get balance. Reason: API is not responding or timing out.');
          } else if (error.status >= 400) {
            if (!error.json().errors[0]) {
              this._log.error(error);
            } else {
              if (error.json().errors[0].description) {
                this._genericModalService.openModal(null, error.json().errors[0].message);
              } else {
                this.cancelSubscriptions();
                this.startSubscriptions();
              }
            }
          }
        }
      );
  }

  private openConfirmationModal() {
    const modalRef = this._modalService.open(SendConfirmationComponent, { backdrop: 'static' });
    modalRef.componentInstance.transaction = this.transaction;
    modalRef.componentInstance.transactionFee = this.estimatedFee;
  }

  protected cancelSubscriptions() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
    if (this.walletBalanceSubscription) {
      this.walletBalanceSubscription.unsubscribe();
    }
  }

  protected startSubscriptions() {
    this.getWalletBalance();
  }
}

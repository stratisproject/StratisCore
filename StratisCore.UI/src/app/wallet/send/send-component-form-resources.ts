import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Network } from '@shared/models/network';

export class SendComponentFormResources {
  public static sendValidationMessages = {
    address: {
      required: 'An address is required.',
      minlength: 'An address is at least 26 characters long.'
    },
    amount: {
      required: 'An amount is required.',
      pattern: 'Enter a valid transaction amount. Only positive numbers and no more than 8 decimals are allowed.',
      min: 'The amount has to be more or equal to 0.00001.',
      max: 'The total transaction amount exceeds your spendable balance.'
    },
    fee: {
      required: 'A fee is required.'
    },
    password: {
      required: 'Your password is required.'
    }
  };

  public static sendToSidechainValidationMessages = {
     destinationAddress: {
      required: 'An address is required.',
      minlength: 'An address is at least 26 characters long.'
    },
    networkSelect: {
      required: 'Please select a network to send to.'
    },
    federationAddress: {
      required: 'An address is required.',
      minlength: 'An address is at least 26 characters long.'
    },
    amount: {
      required: 'An amount is required.',
      pattern: 'Enter a valid transaction amount. Only positive numbers and no more than 8 decimals are allowed.',
      min: 'The amount has to be more or equal to 1.',
      max: 'The total transaction amount exceeds your spendable balance.'
    },
    fee: {
      required: 'A fee is required.'
    },
    password: {
      required: 'Your password is required.'
    }
  };

  public static buildSendForm(fb: FormBuilder, balanceCalculator: () => number): FormGroup {
    return fb.group({
      address: ['', Validators.compose([Validators.required, Validators.minLength(26)])],
      amount: ['', Validators.compose([Validators.required,
        Validators.pattern(/^([0-9]+)?(\.[0-9]{0,8})?$/),
        Validators.min(0.00001),
        (control: AbstractControl) => Validators.max(balanceCalculator())(control)])],
      fee: ['medium', Validators.required],
      password: ['', Validators.required]
    });
  }

  public static buildSendToSidechainForm(fb: FormBuilder, balanceCalculator: () => number): FormGroup {
    return fb.group({
      federationAddress: ['', Validators.compose([Validators.required, Validators.minLength(26)])],
      networkSelect: ['', Validators.compose([Validators.required])],
      destinationAddress: ['', Validators.compose([Validators.required, Validators.minLength(26)])],
      amount: ['', Validators.compose([Validators.required,
        Validators.pattern(/^([0-9]+)?(\.[0-9]{0,8})?$/),
        Validators.min(1),
        (control: AbstractControl) => Validators.max(balanceCalculator())(control)])],
      fee: ['medium', Validators.required],
      password: ['', Validators.required]
    });
  }

  public static stratisNetworks: Network[] = [
    { name: 'Cirrus', federationAddress: 'sg3WNvfWFxLJXXPYsvhGDdzpc9bT4uRQsN', description: 'Cirrus Sidechain'}
  ];

  public static stratisTestNetworks: Network[] = [
    { name: 'CirrusTest', federationAddress: '2N1wrNv5NDayLrKuph9YDVk8Fip8Wr8F8nX', description: 'Cirrus Test Sidechain'}
  ];

  public static cirrusNetworks: Network[] = [
    { name: 'Stratis', federationAddress: 'cnYBwudqzHBtGVELyQNUGzviKV4Ym3yiEo', description: 'Stratis Mainnet'}
  ];

  public static cirrusTestNetworks: Network[] = [
    { name: 'StratisTest', federationAddress: 'xH1GHWVNKwdebkgiFPtQtM4qb3vrvNX2Rg', description: 'Stratis Testnet'}
  ];
}

import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { GlobalService } from '../../../shared/services/global.service';
import { ApiService } from '../../../shared/services/api.service';
import { ModalService } from '../../../shared/services/modal.service';

import { WalletCreation } from '../../../shared/classes/wallet-creation';

import { Subscription } from 'rxjs/Subscription';
import { Subscribable } from 'rxjs/Observable';

import { SecretWordIndexGenerator } from './secret-word-index-generator';

@Component({
  selector: 'app-confirm-mnemonic',
  templateUrl: './confirm-mnemonic.component.html',
  styleUrls: ['./confirm-mnemonic.component.css']
})
export class ConfirmMnemonicComponent implements OnInit {

  public secretWordIndexGenerator = new SecretWordIndexGenerator();

  constructor(private globalService: GlobalService, private apiService: ApiService, private genericModalService: ModalService, private route: ActivatedRoute, private router: Router, private fb: FormBuilder) {
    this.buildMnemonicForm();
  }
  private subscription: Subscription;
  private newWallet: WalletCreation;
  public mnemonicForm: FormGroup;
  public matchError: string = "";
  public isCreating: boolean;

  ngOnInit() {
    this.subscription = this.route.queryParams.subscribe(params => {
      this.newWallet = new WalletCreation(
        params["name"],
        params["mnemonic"],
        params["password"],
        params["password"]
      )
    });
  }

  private buildMnemonicForm(): void {
    this.mnemonicForm = this.fb.group({
      "word1": ["",
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(24),
          Validators.pattern(/^[a-zA-Z]*$/)
        ])
      ],
      "word2": ["",
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(24),
          Validators.pattern(/^[a-zA-Z]*$/)
        ])
      ],
      "word3": ["",
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(24),
          Validators.pattern(/^[a-zA-Z]*$/)
        ])
      ]
    });

    this.mnemonicForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
  }

  onValueChanged(data?: any) {
    if (!this.mnemonicForm) { return; }
    const form = this.mnemonicForm;
    for (const field in this.formErrors) {
      this.formErrors[field] = '';
      const control = form.get(field);
      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }

    this.matchError = "";
  }

  formErrors = {
    'word1': '',
    'word2': '',
    'word3': ''
  };

  validationMessages = {
    'word1': {
      'required': 'This secret word is required.',
      'minlength': 'A secret word must be at least one character long',
      'maxlength': 'A secret word can not be longer than 24 characters',
      'pattern': 'Please enter a valid scret word. [a-Z] are the only characters allowed.'
    },
    'word2': {
      'required': 'This secret word is required.',
      'minlength': 'A secret word must be at least one character long',
      'maxlength': 'A secret word can not be longer than 24 characters',
      'pattern': 'Please enter a valid scret word. [a-Z] are the only characters allowed.'
    },
    'word3': {
      'required': 'This secret word is required.',
      'minlength': 'A secret word must be at least one character long',
      'maxlength': 'A secret word can not be longer than 24 characters',
      'pattern': 'Please enter a valid scret word. [a-Z] are the only characters allowed.'
    }
  };

  public onConfirmClicked() {
    this.checkMnemonic();
    if (this.checkMnemonic()) {
      this.isCreating = true;
      this.createWallet(this.newWallet);
    }
  }

  public onBackClicked() {
    this.router.navigate(['/setup/create/show-mnemonic'], { queryParams : { name: this.newWallet.name, mnemonic: this.newWallet.mnemonic, password: this.newWallet.password }});
  }

  private checkMnemonic(): boolean {
    let mnemonic = this.newWallet.mnemonic;
    let mnemonicArray = mnemonic.split(" ");

    if (this.mnemonicForm.get('word1').value.trim() === mnemonicArray[this.secretWordIndexGenerator.index1] &&
        this.mnemonicForm.get('word2').value.trim() === mnemonicArray[this.secretWordIndexGenerator.index2] &&
        this.mnemonicForm.get('word3').value.trim() === mnemonicArray[this.secretWordIndexGenerator.index3]) {
      return true;
    } else {
      this.matchError = 'The secret words do not match.'
      return false;
    }
  }

  private createWallet(wallet: WalletCreation) {
    this.apiService
      .createStratisWallet(wallet)
      .subscribe(
        response => {
          if (response.status >= 200 && response.status < 400){
            this.genericModalService.openModal("Wallet Created", "Your wallet has been created.<br>Keep your secret words and password safe!");
            this.router.navigate(['']);
          }
        },
        error => {
          this.isCreating = false;
          console.log(error);
          if (error.status === 0) {
            this.genericModalService.openModal(null, null);
          } else if (error.status >= 400) {
            if (!error.json().errors[0]) {
              console.log(error);
            }
            else {
              this.genericModalService.openModal(null, error.json().errors[0].message);
              this.router.navigate(['/setup/create']);
            }
          }
        }
      )
    ;
  }
}

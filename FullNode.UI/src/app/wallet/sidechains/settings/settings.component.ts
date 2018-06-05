import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import {NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

import { ApiService } from '../../../shared/services/api.service';
import { ModalService } from '../../../shared/services/modal.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BaseForm } from '../../../shared/components/base-form';
import { GlobalService } from '../../../shared/services/global.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent extends BaseForm implements OnInit, OnDestroy {
  public isSaving = false;
  public settingsForm: FormGroup;
  public saved = false;

  formErrors = {
    'address': ''
  };

  validationMessages = {
    'address': {
      'required': 'An address is required.',
      'minlength': 'An address is at least 26 characters long.'
    }
  };

  constructor(
    public activeModal: NgbActiveModal,
    private router: Router,
    private apiService: ApiService,
    private genericModalService: ModalService,
    private globalService: GlobalService,
    private fb: FormBuilder) {
      super();
      this.buildSettingsForm();
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  private buildSettingsForm(): void {
    this.settingsForm = this.fb.group({
      'address': [this.globalService.federationAddress, Validators.compose([Validators.minLength(26)])],
      'crossChainTransactionsEnabled': [this.globalService.crossChainTransactionsEnabled ? 'Enable' : 'Disable'],
      'federationAddressAutoPopulationEnabled': [this.globalService.federationAddressAutoPopulationEnabled ? 'Enable' : 'Disable']
    });

    this.settingsForm.valueChanges
      .debounceTime(300)
      .subscribe(data => this.onValueChanged(data));

    // Make address optionally required if auto-population was enabled
    this.settingsForm.get('federationAddressAutoPopulationEnabled').valueChanges.subscribe(
      (value: string) => {
        const addressControl = this.settingsForm.get('address');
        if (value === 'Disable') {
          addressControl.clearValidators();
        } else {
          addressControl.setValidators([Validators.minLength(26), Validators.required]);
        }
        addressControl.updateValueAndValidity();
    });
  }

  onValueChanged(data?: any) {
    if (!this.settingsForm) { return; }
    const form = this.settingsForm;
    this.validateControls(form, this.formErrors, this.validationMessages);
  }

  public save() {
    this.saved = false;
    this.isSaving = true;
    this.globalService.crossChainTransactionsEnabled =
            this.settingsForm.get('crossChainTransactionsEnabled').value === 'Enable';
    this.globalService.federationAddressAutoPopulationEnabled =
            this.settingsForm.get('federationAddressAutoPopulationEnabled').value === 'Enable';
    this.globalService.federationAddress = this.settingsForm.get('address').value;
    this.isSaving = false;
    this.saved = true;
  }
}

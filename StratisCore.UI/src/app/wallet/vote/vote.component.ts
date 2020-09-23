import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Animations } from '@shared/animations/animations';
import { VoteRequest } from '@shared/models/vote-request';
import { WalletInfoRequest } from '@shared/models/wallet-info';
import { ApiService } from '@shared/services/api.service';
import { GlobalService } from '@shared/services/global.service';
import { TaskBarService } from '@shared/services/task-bar-service';
import { WalletService } from '@shared/services/wallet.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-vote',
  templateUrl: './vote.component.html',
  styleUrls: ['./vote.component.scss'],
  animations: Animations.fadeIn
})
export class VoteComponent implements OnInit, OnDestroy {

  public testnetEnabled = false;
  public noBalance: boolean;
  public isVoting = false;
  public hasVoted = false;
  public voteResult: string;
  private walletInfoRequest: WalletInfoRequest;
  public maxAmount: number;
  public fee: number;
  public voteForm: FormGroup;
  private formValueChanges$: Subscription;
  private maximumBalanceSubscription: Subscription;
  public apiError: string;

  constructor(private apiService: ApiService, public globalService: GlobalService, private fb: FormBuilder, private walletService: WalletService, private taskBarService: TaskBarService) {
    this.testnetEnabled = globalService.getTestnetEnabled();
    this.buildVoteForm();
  }

  ngOnInit() {
    if (localStorage.getItem('hasVoted') === "true") {
      this.hasVoted = true;
      this.voteResult = localStorage.getItem('voteResult');
    } else {
      this.hasVoted = false;
      this.voteResult = "false";
    }
    this.getMaximumAmount();
  }

  ngOnDestroy() {
    this.cancelSubscriptions();
  }

  private getMaximumAmount(): void {
    this.walletInfoRequest = new WalletInfoRequest(this.globalService.getWalletName(), 0, "low");
    this.maximumBalanceSubscription = this.apiService.getMaximumBalance(this.walletInfoRequest)
      .subscribe(
        response => {
          this.maxAmount = response.maxSpendableAmount;
          if (this.maxAmount < 1) {
            this.noBalance = true;
          } else {
            this.noBalance = false;
          }
        },
        () => {
          this.cancelSubscriptions();
        }
      )
    ;
  }

  public vote(): void {
    let voteToBoolean;
    if (this.voteForm.get('vote').value === "Yes") {
      voteToBoolean = true;
    } else {
      voteToBoolean = false;
    }

    let voteRequest = new VoteRequest(this.globalService.getWalletName(), this.voteForm.get('walletPassword').value, voteToBoolean)

    this.isVoting = true;
    this.walletService.vote(voteRequest).toPromise()
      .then(transactionResponse => {
        this.isVoting=false;
        this.hasVoted=true;
        localStorage.setItem('hasVoted', "true");
        localStorage.setItem('voteResult', voteToBoolean)
        this.voteResult = localStorage.getItem('voteResult');
      }).catch(error => {
        this.isVoting = false;
        this.hasVoted=false;
        this.apiError = error.error.errors[0].message;
    })
  }

  private buildVoteForm(): void {
    this.voteForm = this.fb.group({
      vote: ['', Validators.required],
      walletPassword: ['', Validators.required]
    });

    this.formValueChanges$ = this.voteForm.valueChanges
      .subscribe(() => this.onValueChanged());
  }

  onValueChanged(): void {
    if (!this.voteForm) { return; }
    const form = this.voteForm;
    for (const field in this.formErrors) {
      this.formErrors[field] = '';
      const control = form.get(field);
      if (control && control.dirty && !control.valid) {
        const messages = this.swapValidationMessages[field];
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }

  formErrors = {
    vote: '',
    walletPassword: '',
  };

  swapValidationMessages = {
    vote: {
      required: 'Your vote is required.'
    },
    walletPassword: {
      required: 'Your password is required.'
    }
  };

  private cancelSubscriptions(): void {
    if (this.maximumBalanceSubscription) {
      this.maximumBalanceSubscription.unsubscribe();
    }
  }
}

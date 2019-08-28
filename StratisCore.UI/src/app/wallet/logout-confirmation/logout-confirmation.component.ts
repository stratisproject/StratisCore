import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import { GlobalService } from '@shared/services/global.service';
import { ModalService } from '@shared/services/modal.service';
import { StakingService } from '@shared/services/staking-service';

@Component({
  selector: 'app-logout-confirmation',
  templateUrl: './logout-confirmation.component.html',
  styleUrls: ['./logout-confirmation.component.css']
})
export class LogoutConfirmationComponent implements OnInit {

  constructor(
    public activeModal: NgbActiveModal,
    private router: Router,
    private stakingService: StakingService,
    private genericModalService: ModalService,
    private globalService: GlobalService) { }

  public sidechainEnabled: boolean;

  ngOnInit() {
    this.sidechainEnabled = this.globalService.getSidechainEnabled();
  }

  public onLogout() {
    if (!this.sidechainEnabled) {
      this.stakingService.stopStaking();

    }
    this.activeModal.close();
    this.router.navigate(['/login']);
  }
}

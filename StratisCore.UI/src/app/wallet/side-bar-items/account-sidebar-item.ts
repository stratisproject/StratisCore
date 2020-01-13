import { Injectable } from '@angular/core';
import { StakingService } from '@shared/services/staking-service';
import { SideBarItemBase } from '@shared/components/side-bar/side-bar-item-base';
import { WalletService } from '@shared/services/wallet.service';

@Injectable()
export class AccountSidebarItem extends SideBarItemBase {
  private balanceChanged: boolean;
  private selectedField: boolean;

  constructor(private walletService: WalletService) {
    super('Account', 'wallet/dashboard', ['side-bar-item-account']);

    if (!this.visible) {
      this.subscriptions.push(walletService.walletActivityFlag
        .subscribe(newBalance => {
          this.balanceChanged = !this.selected && newBalance
        }));
    }
  }

  public displayText: string;
  public order: number;
  public route: string;
  public visible: boolean;

  public get selected(): boolean {
    return this.selectedField;
  }

  public set selected(value: boolean) {
    this.selectedField = value;
    this.walletService.clearWalletActivityFlag();
    this.balanceChanged = false;
  }

  protected getStatusClasses(): string[] {
    return this.balanceChanged ? ['bubble', 'bg-warning', 'side-bar-item-account-new'] : [];
  }
}

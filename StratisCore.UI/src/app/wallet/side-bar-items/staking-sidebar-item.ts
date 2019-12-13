import { Injectable } from "@angular/core";
import { StakingService } from "@shared/services/staking-service";
import { SideBarItemBase } from "@shared/components/side-bar/side-bar-item-base";

@Injectable()
export class StakingSidebarItem extends SideBarItemBase {
  private isStaking: boolean;

  constructor(private stakingService: StakingService) {
    super('Staking', 'wallet/staking', ['side-bar-item-staking']);
    this.visible = this.stakingService.canStake;
    if (this.visible) {
      this.subscriptions.push(stakingService.stakingInfo()
        .subscribe(stakingInfo => {
          if (stakingInfo && stakingInfo.enabled) {
            this.isStaking = true;
          }
        }));
    }
  }

  displayText: string;
  order: number;
  route: string;
  selected: boolean;
  visible: boolean;

  protected getStatusClasses(): string[] {
    return this.isStaking ? ['side-bar-item-staking-active'] : [];
  }
}

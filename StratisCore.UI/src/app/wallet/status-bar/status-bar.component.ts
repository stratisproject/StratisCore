import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { GlobalService } from '@shared/services/global.service';
import { StakingService } from '@shared/services/staking-service';
import { tap } from 'rxjs/operators';
import { GeneralInfo } from '@shared/services/interfaces/api.i';
import { NodeService } from '@shared/services/node-service';

@Component({
  selector: 'status-bar',
  templateUrl: './status-bar.component.html',
  styleUrls: ['./status-bar.component.css']
})
export class StatusBarComponent implements OnInit {
  public generalInfo: Observable<GeneralInfo>;
  public percentSynced: string;
  public toolTip = '';
  public connectedNodesTooltip = '';

  constructor(
    private nodeService: NodeService,
    private stakingService: StakingService,
    private globalService: GlobalService) {
  }

  public ngOnInit(): void {
    this.generalInfo = this.nodeService.generalInfo()
      .pipe(tap(
        response => {
          // Don't show if wallet is ahead of chainTip
          if (response.lastBlockSyncedHeight > response.chainTip) {
            response.chainTip = response.lastBlockSyncedHeight;
          }

          this.percentSynced = (response.percentSynced || 0).toFixed(0) + '%';
          const processedText = `Processed ${response.lastBlockSyncedHeight || '0'} out of ${response.chainTip} blocks.`;

          this.toolTip = `Synchronizing. ${processedText}`;

          if (response.connectedNodes === 1) {
            this.connectedNodesTooltip = '1 connection';
          } else if (response.connectedNodes >= 0) {
            this.connectedNodesTooltip = `${response.connectedNodes} connections`;
          }

          if (response.percentSynced === 100) {
            this.toolTip = `Up to date.  ${processedText}`;
          }
        }));
  }
}

import { Component } from '@angular/core';
import { Animations } from '@shared/animations/animations';
import { TaskBarService } from '@shared/services/task-bar-service';
import { ResyncComponent } from './components/resync/resync.component';
import { AddNodeComponent } from './components/add-node/add-node.component';
import { GenerateAddressesComponent } from './components/generate-addresses/generate-addresses.component';
import { BroadcastTransactionComponent } from './components/broadcast-transaction/broadcast-transaction.component';

@Component({
  selector: 'app-advanced',
  templateUrl: './advanced.component.html',
  styleUrls: ['./advanced.component.scss'],
  animations: Animations.fadeIn
})

export class AdvancedComponent {
  constructor(private taskBarService: TaskBarService) {
  }

  public openRescan(): void {
    this.taskBarService.open(ResyncComponent, {}, {
      showCloseButton: true,
      taskBarWidth: '500px',
      title: 'Rescan Wallet',
    }).then(ref => ref.closeWhen(ref.instance.rescanStarted));
  }

  public addNode(): void {
    this.taskBarService.open(AddNodeComponent, {}, {
      showCloseButton: true,
      taskBarWidth: '500px',
      title: 'Add Node'
    }).then(ref => ref.closeWhen(ref.instance.nodeAdded));
  }

  public broadcastTransaction(): void {
    this.taskBarService.open(BroadcastTransactionComponent, {}, {
      showCloseButton: true,
      taskBarWidth: '500px',
      title: 'Broadcast Transaction'
    }).then(ref => ref.closeWhen(ref.instance.transactionBroadcasted));
  }

  public generateAddresses(): void {
    this.taskBarService.open(GenerateAddressesComponent, {}, {
      showCloseButton: true,
      taskBarWidth: '500px',
      title: 'Generate Addresses'
    });
  }
}

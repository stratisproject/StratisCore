import { Component, OnInit, OnDestroy } from '@angular/core';
import { Animations } from '@shared/animations/animations';


@Component({
  selector: 'app-advanced',
  templateUrl: './advanced.component.html',
  styleUrls: ['./advanced.component.scss'],
  animations: Animations.fadeIn
})

export class AdvancedComponent implements OnInit, OnDestroy {
  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }
}

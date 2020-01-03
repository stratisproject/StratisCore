import { animate, state, style, transition, trigger } from '@angular/animations';

export class Animations {
  public static fadeIn = [
    trigger('fadeIn', [
      state('in', style({
        opacity: 1
      })),
      transition(':enter', [
        style({
          opacity: 0
        }),
        animate(400)
      ]),
      transition(':leave',
        animate(400, style({opacity: 0})))
    ])
  ]
}

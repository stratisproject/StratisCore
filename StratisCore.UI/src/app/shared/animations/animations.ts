import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';

export class Animations {
  public static fadeIn = [
    trigger('fadeIn', [
      transition(':enter', [
        style({
          opacity: 0
        }),
        animate(400)
      ]),
      transition(':leave',
        animate(400, style({opacity: 0})))
    ])
  ];
  public static expand = [
    trigger('state', [
      state(
        'visible',
        style({
          opacity: '1'
        })
      ),
      state(
        'hidden',
        style({
          opacity: '0'
        })
      ),
      transition('* => visible', [animate('500ms ease-out')]),
      transition('visible => hidden', [animate('500ms ease-out')])
    ])
  ];

  public static statusBar = [
    trigger('highlight', [
      transition(':enter', [
        style({
          opacity: 0
        }),
        animate(400)
      ]),
      transition(':leave',
        animate(400, style({opacity: 0})))
    ])
  ];

  public static openClose = [
    trigger('openClose', [
      state('closed', style({
        opacity: 0,
        width: '0px',
        overflow: 'hidden'
      })),
      state('open', style({
        opacity: 0.95,
        width: '*',
        overflow: 'hidden'
      })),
      transition('closed => open', animate('300ms ease-out')),
      transition('open => closed', animate('150ms ease-in'))
    ])
  ];

  public static collapseExpand = [
    trigger('collapseExpand', [
      state('collapsed', style({
        opacity: 0,
        height: 0,
        overflow: 'hidden'
      })),
      state('expanded', style({
        opacity: 1,
        height: '*',
        overflow: 'hidden'
      })),
      transition('* => expanded', animate('200ms ease-out')),
      transition('expanded => collapsed', animate('150ms ease-in'))
    ])
  ]
}

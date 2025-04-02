import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, InputSignal, output, OutputEmitterRef } from '@angular/core';
import { MatRipple } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { Params, RouterLink } from '@angular/router';
import { RouterLinkType } from '../../models/route-link.types';

@Component({
  selector: 'eu-linkable-navigation-card',
  imports: [
    RouterLink,
    MatIcon,
    MatRipple,
    NgTemplateOutlet,
  ],
  templateUrl: './linkable-navigation-card.component.html',
  styleUrl: './linkable-navigation-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkableNavigationCardComponent {
  public readonly link: InputSignal<RouterLinkType | any> = input.required<RouterLinkType | any>();
  public readonly queryParams: InputSignal<Params | null | undefined> = input();
  public readonly roleType: InputSignal<'link' | 'button'> = input<'link' | 'button'>('link');
  public readonly icon: InputSignal<string | null> = input<string | null>(null);
  public readonly cardTitle: InputSignal<string> = input.required<string>();
  public readonly cardDetails: InputSignal<string> = input.required<string>();

  /* eslint-disable @typescript-eslint/no-invalid-void-type */
  /**
   * Output emitted when this component has a roleType of 'button' and the button is clicked.
   * @type {OutputEmitterRef<void>}
   */
  public readonly buttonClicked: OutputEmitterRef<void> = output<void>();
  /* eslint-enable @typescript-eslint/no-invalid-void-type */
}

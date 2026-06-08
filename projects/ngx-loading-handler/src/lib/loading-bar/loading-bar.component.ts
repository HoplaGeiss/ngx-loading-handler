import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Command } from '../command.models';

@Component({
  selector: 'ngx-loading-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bar" [class.active]="command().isLoading()" aria-live="polite">
      @if (command().isLoading()) {
        <span class="sr-only">Loading…</span>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: var(--ngx-loading-bar-z-index, 9999);
        pointer-events: none;
      }
      .bar {
        height: var(--ngx-loading-bar-height, 3px);
        overflow: hidden;
        background: transparent;
      }
      .bar::after {
        content: '';
        display: block;
        height: 100%;
        width: 45%;
        background: var(--ngx-loading-bar-color, #3b82f6);
        border-radius: 0 2px 2px 0;
        transform: translateX(-110%);
      }
      .bar.active::after {
        animation: ngx-bar-slide 1.4s ease-in-out infinite;
      }
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
      }
      @keyframes ngx-bar-slide {
        0% {
          transform: translateX(-110%);
        }
        60% {
          transform: translateX(160%);
        }
        100% {
          transform: translateX(160%);
        }
      }
    `,
  ],
})
export class LoadingBarComponent {
  command = input.required<Command<unknown>>();
}

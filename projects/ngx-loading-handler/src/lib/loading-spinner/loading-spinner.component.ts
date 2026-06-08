import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Command } from '../command.models';

@Component({
  selector: 'ngx-loading-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (command().isLoading()) {
      <span class="spinner" aria-live="polite">
        <span class="ring" aria-hidden="true"></span>
        <span class="sr-only">Loading…</span>
      </span>
    }
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .spinner {
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .ring {
        display: block;
        width: var(--ngx-spinner-size, 1.25rem);
        height: var(--ngx-spinner-size, 1.25rem);
        border-radius: 50%;
        border: var(--ngx-spinner-thickness, 2px) solid var(--ngx-spinner-color, currentColor);
        border-top-color: transparent;
        animation: ngx-spin 0.7s linear infinite;
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
      @keyframes ngx-spin {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class LoadingSpinnerComponent {
  command = input.required<Command<unknown>>();
}

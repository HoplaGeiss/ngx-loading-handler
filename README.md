# ngx-loading-handler

[![npm version](https://img.shields.io/npm/v/ngx-loading-handler.svg)](https://www.npmjs.com/package/ngx-loading-handler)
[![CI](https://github.com/HoplaGeiss/ngx-loading-handler/actions/workflows/ci.yml/badge.svg)](https://github.com/HoplaGeiss/ngx-loading-handler/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> Wrap any Angular mutation in one line. Get loading, error, and result signals automatically.

**[Live demo →](https://hoplaGeiss.github.io/ngx-loading-handler/)**

---

## The problem

Every Angular mutation produces the same boilerplate — repeated for every button, every form submit, every API call:

**Without `ngx-loading-handler`** (~25 lines, every time):

```ts
// component.ts
isLoading = false;
hasError = false;
errorMessage = '';
private destroyRef = inject(DestroyRef);

save() {
  this.isLoading = true;
  this.hasError = false;
  this.orderService
    .save(this.order)
    .pipe(
      catchError((err) => {
        this.hasError = true;
        this.errorMessage = err.message;
        return EMPTY;
      }),
      finalize(() => (this.isLoading = false)),
      takeUntilDestroyed(this.destroyRef),
    )
    .subscribe();
}
```

```html
<!-- component.html -->
<button (click)="save()" [disabled]="isLoading">
  @if (isLoading) { Saving… } @else { Save }
</button>
@if (hasError) {
  <p class="error">{{ errorMessage }}</p>
}
```

**With `ngx-loading-handler`** (one line):

```ts
saveCommand = injectCommand(() => this.orderService.save(this.order));
```

```html
<button (click)="saveCommand.execute()" [disabled]="saveCommand.isLoading()">
  @if (saveCommand.isLoading()) { Saving… } @else { Save }
  <ngx-loading-spinner [command]="saveCommand" />
</button>
@if (saveCommand.hasError()) {
  <p class="error">{{ saveCommand.error()?.message }}</p>
}
```

---

## Installation

```bash
npm install ngx-loading-handler
# or
pnpm add ngx-loading-handler
```

---

## Basic usage

```ts
import { Component, inject } from '@angular/core';
import { injectCommand } from 'ngx-loading-handler';

@Component({ /* ... */ })
export class OrderComponent {
  private orderService = inject(OrderService);

  saveCommand = injectCommand(
    () => this.orderService.save(this.order)
  );
}
```

```html
<button (click)="saveCommand.execute()" [disabled]="saveCommand.isLoading()">
  Save
</button>

@if (saveCommand.hasError()) {
  <p>{{ saveCommand.error()?.message }}</p>
}

@if (saveCommand.hasExecuted() && !saveCommand.isLoading()) {
  <p>Saved! ID: {{ saveCommand.result()?.id }}</p>
}
```

Works with Observables **and** Promises. If `execute()` is called while already loading, the previous in-flight call is cancelled and a fresh one starts.

---

## API reference

### `injectCommand<T>(fn, options?)`

Must be called in an injection context (field initializer, constructor body, or `runInInjectionContext`).

| Parameter | Type | Description |
|-----------|------|-------------|
| `fn` | `() => Observable<T> \| Promise<T>` | Factory called each time `execute()` is invoked |
| `options` | `CommandOptions` | Optional callbacks (see below) |

**Returns** a `Command<T>` object.

### State signals

| Signal | Type | Description |
|--------|------|-------------|
| `isLoading` | `Signal<boolean>` | `true` while the mutation is in flight |
| `hasError` | `Signal<boolean>` | `true` after a failure |
| `error` | `Signal<unknown>` | The thrown error, or `null` |
| `result` | `Signal<T \| null>` | The last successful return value |
| `hasExecuted` | `Signal<boolean>` | `true` after the first execution completes (success or error) |

### Methods

| Method | Description |
|--------|-------------|
| `execute()` | Calls `fn()`. Cancels any in-flight Observable before starting. |
| `reset()` | Cancels any in-flight call and clears all state back to initial values. |

### `CommandOptions`

```ts
interface CommandOptions {
  onSuccess?: (result: unknown) => void;
  onError?: (error: unknown) => void;
}
```

---

## Optional UI components

### `<ngx-loading-spinner>`

An inline spinner that appears while the command is loading. Place it inside a button or next to a label.

```ts
import { LoadingSpinnerComponent } from 'ngx-loading-handler';
```

```html
<button (click)="saveCommand.execute()" [disabled]="saveCommand.isLoading()">
  Save
  <ngx-loading-spinner [command]="saveCommand" />
</button>
```

**CSS custom properties:**

| Property | Default | Description |
|----------|---------|-------------|
| `--ngx-spinner-size` | `1.25rem` | Width and height of the ring |
| `--ngx-spinner-thickness` | `2px` | Border width |
| `--ngx-spinner-color` | `currentColor` | Ring colour |

### `<ngx-loading-bar>`

A thin progress bar fixed to the top of the viewport. Add it once to your app shell.

```ts
import { LoadingBarComponent } from 'ngx-loading-handler';
```

```html
<!-- app.html -->
<ngx-loading-bar [command]="pageCommand" />
```

**CSS custom properties:**

| Property | Default | Description |
|----------|---------|-------------|
| `--ngx-loading-bar-height` | `3px` | Bar height |
| `--ngx-loading-bar-color` | `#3b82f6` | Bar colour |
| `--ngx-loading-bar-z-index` | `9999` | Stack order |

---

## Advanced usage

### Callbacks

```ts
saveCommand = injectCommand(
  () => this.orderService.save(this.order),
  {
    onSuccess: (result) => console.log('Saved:', result),
    onError: (err) => console.error('Failed:', err),
  }
);
```

### With ngx-herald (toast notifications)

```ts
import { inject } from '@angular/core';
import { toast } from 'ngx-herald';
import { injectCommand } from 'ngx-loading-handler';

saveCommand = injectCommand(
  () => this.orderService.save(this.order),
  {
    onSuccess: () => toast.success('Order saved'),
    onError: (err) => toast.error(`Failed: ${err.message}`),
  }
);
```

### Promises

`injectCommand` accepts any function that returns a Promise:

```ts
uploadCommand = injectCommand(
  () => fetch('/api/upload', { method: 'POST', body: this.file })
);
```

---

## TypeScript types

```ts
import type { Command, CommandOptions } from 'ngx-loading-handler';

// Command<T> — what injectCommand returns
interface Command<T> {
  isLoading: Signal<boolean>;
  hasError: Signal<boolean>;
  error: Signal<unknown>;
  result: Signal<T | null>;
  hasExecuted: Signal<boolean>;
  execute: () => void;
  reset: () => void;
}

interface CommandOptions {
  onSuccess?: (result: unknown) => void;
  onError?: (error: unknown) => void;
}
```

---

## Requirements

- Angular ≥ 21
- RxJS ≥ 7.8 (peer dependency)

---

## Contributing

Issues and PRs are welcome. Please open an issue before submitting a large change.

```bash
pnpm install
pnpm test          # unit tests
ng serve demo      # demo app at localhost:4200
```

---

## License

MIT

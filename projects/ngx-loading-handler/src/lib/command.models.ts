import { Signal } from '@angular/core';

export interface Command<T> {
  isLoading: Signal<boolean>;
  hasError: Signal<boolean>;
  error: Signal<unknown>;
  result: Signal<T | null>;
  hasExecuted: Signal<boolean>;
  execute: () => void;
  reset: () => void;
}

export interface CommandOptions {
  onSuccess?: (result: unknown) => void;
  onError?: (error: unknown) => void;
}

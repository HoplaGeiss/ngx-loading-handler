import { DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, Subscription, take } from 'rxjs';
import { Command, CommandOptions } from './command.models';
import { isObservable } from './command.utils';

export function injectCommand<T>(
  fn: () => Observable<T> | Promise<T>,
  options?: CommandOptions,
): Command<T> {
  const destroyRef = inject(DestroyRef);

  const _isLoading = signal(false);
  const _hasError = signal(false);
  const _error = signal<unknown>(null);
  const _result = signal<T | null>(null);
  const _hasExecuted = signal(false);

  let currentSubscription: Subscription | null = null;

  function execute(): void {
    currentSubscription?.unsubscribe();

    _isLoading.set(true);
    _hasError.set(false);
    _error.set(null);

    const source = fn();

    const handleNext = (value: T): void => {
      _result.set(value);
      _isLoading.set(false);
      _hasExecuted.set(true);
      options?.onSuccess?.(value);
    };

    const handleError = (err: unknown): void => {
      _error.set(err);
      _hasError.set(true);
      _isLoading.set(false);
      _hasExecuted.set(true);
      options?.onError?.(err);
    };

    if (isObservable(source)) {
      currentSubscription = source
        .pipe(take(1), takeUntilDestroyed(destroyRef))
        .subscribe({ next: handleNext, error: handleError });
    } else {
      source.then(handleNext).catch(handleError);
    }
  }

  function reset(): void {
    currentSubscription?.unsubscribe();
    _isLoading.set(false);
    _hasError.set(false);
    _error.set(null);
    _result.set(null);
    _hasExecuted.set(false);
  }

  return {
    isLoading: _isLoading.asReadonly(),
    hasError: _hasError.asReadonly(),
    error: _error.asReadonly(),
    result: _result.asReadonly(),
    hasExecuted: _hasExecuted.asReadonly(),
    execute,
    reset,
  };
}

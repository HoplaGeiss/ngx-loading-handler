import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { injectCommand } from './command.factory';
import { CommandOptions } from './command.models';

describe('injectCommand', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  function setup<T>(fn: () => ReturnType<typeof of<T>>, options?: CommandOptions) {
    return TestBed.runInInjectionContext(() => injectCommand<T>(fn as never, options));
  }

  it('initialises all signals to their default values', () => {
    const cmd = setup(() => of('x'));
    expect(cmd.isLoading()).toBe(false);
    expect(cmd.hasError()).toBe(false);
    expect(cmd.error()).toBeNull();
    expect(cmd.result()).toBeNull();
    expect(cmd.hasExecuted()).toBe(false);
  });

  it('sets isLoading while the source is in flight', () => {
    const subject = new Subject<string>();
    const cmd = TestBed.runInInjectionContext(() =>
      injectCommand(() => subject.asObservable()),
    );
    cmd.execute();
    expect(cmd.isLoading()).toBe(true);
    expect(cmd.hasExecuted()).toBe(false);
  });

  it('sets result and clears loading after a successful Observable', () => {
    const cmd = setup(() => of('hello'));
    cmd.execute();
    expect(cmd.result()).toBe('hello');
    expect(cmd.isLoading()).toBe(false);
    expect(cmd.hasExecuted()).toBe(true);
    expect(cmd.hasError()).toBe(false);
  });

  it('sets error signals and clears loading after a failed Observable', () => {
    const err = new Error('boom');
    const cmd = TestBed.runInInjectionContext(() =>
      injectCommand(() => throwError(() => err)),
    );
    cmd.execute();
    expect(cmd.hasError()).toBe(true);
    expect(cmd.error()).toBe(err);
    expect(cmd.isLoading()).toBe(false);
    expect(cmd.hasExecuted()).toBe(true);
    expect(cmd.result()).toBeNull();
  });

  it('cancels the in-flight Observable when execute is called again', () => {
    const subject = new Subject<string>();
    let callCount = 0;
    const cmd = TestBed.runInInjectionContext(() =>
      injectCommand(() => {
        callCount++;
        return subject.asObservable();
      }),
    );
    cmd.execute();
    cmd.execute();
    expect(callCount).toBe(2);
    // Resolve the subject — only one emission expected (second call)
    subject.next('value');
    expect(cmd.result()).toBe('value');
  });

  it('resets all signals back to initial values', () => {
    const cmd = setup(() => of('hello'));
    cmd.execute();
    cmd.reset();
    expect(cmd.isLoading()).toBe(false);
    expect(cmd.hasError()).toBe(false);
    expect(cmd.error()).toBeNull();
    expect(cmd.result()).toBeNull();
    expect(cmd.hasExecuted()).toBe(false);
  });

  it('cancels an in-flight Observable on reset', () => {
    const subject = new Subject<string>();
    const cmd = TestBed.runInInjectionContext(() =>
      injectCommand(() => subject.asObservable()),
    );
    cmd.execute();
    expect(cmd.isLoading()).toBe(true);
    cmd.reset();
    subject.next('late value');
    expect(cmd.result()).toBeNull();
    expect(cmd.isLoading()).toBe(false);
  });

  it('calls onSuccess with the emitted value', () => {
    const onSuccess = vi.fn();
    const cmd = setup(() => of('result'), { onSuccess });
    cmd.execute();
    expect(onSuccess).toHaveBeenCalledOnce();
    expect(onSuccess).toHaveBeenCalledWith('result');
  });

  it('calls onError with the thrown error', () => {
    const onError = vi.fn();
    const err = new Error('fail');
    const cmd = TestBed.runInInjectionContext(() =>
      injectCommand(() => throwError(() => err), { onError }),
    );
    cmd.execute();
    expect(onError).toHaveBeenCalledOnce();
    expect(onError).toHaveBeenCalledWith(err);
  });

  it('works with a resolved Promise', async () => {
    const cmd = TestBed.runInInjectionContext(() =>
      injectCommand(() => Promise.resolve('async')),
    );
    cmd.execute();
    expect(cmd.isLoading()).toBe(true);
    await Promise.resolve();
    expect(cmd.result()).toBe('async');
    expect(cmd.isLoading()).toBe(false);
    expect(cmd.hasExecuted()).toBe(true);
  });

  it('handles a rejected Promise', async () => {
    const err = new Error('async fail');
    const cmd = TestBed.runInInjectionContext(() =>
      injectCommand(() => Promise.reject(err)),
    );
    cmd.execute();
    await Promise.resolve();
    await Promise.resolve(); // rejection goes through an extra microtask hop
    expect(cmd.hasError()).toBe(true);
    expect(cmd.error()).toBe(err);
    expect(cmd.isLoading()).toBe(false);
  });

  it('clears the previous error when execute is called again', () => {
    let shouldFail = true;
    const cmd = TestBed.runInInjectionContext(() =>
      injectCommand(() =>
        shouldFail ? throwError(() => new Error('fail')) : of('ok'),
      ),
    );
    cmd.execute();
    expect(cmd.hasError()).toBe(true);
    shouldFail = false;
    cmd.execute();
    expect(cmd.hasError()).toBe(false);
    expect(cmd.result()).toBe('ok');
  });
});

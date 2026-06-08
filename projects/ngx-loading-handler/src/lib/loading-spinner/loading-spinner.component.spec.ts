import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Command } from '../command.models';
import { LoadingSpinnerComponent } from './loading-spinner.component';

function makeMockCommand(isLoading = false) {
  const isLoadingSignal = signal(isLoading);
  const command: Command<unknown> = {
    isLoading: isLoadingSignal.asReadonly(),
    hasError: signal(false).asReadonly(),
    error: signal(null).asReadonly(),
    result: signal(null).asReadonly(),
    hasExecuted: signal(false).asReadonly(),
    execute: vi.fn(),
    reset: vi.fn(),
  };
  return { command, setLoading: (v: boolean) => isLoadingSignal.set(v) };
}

function setup(isLoading: boolean) {
  const mock = makeMockCommand(isLoading);

  @Component({
    imports: [LoadingSpinnerComponent],
    template: '<ngx-loading-spinner [command]="command" />',
  })
  class TestHost {
    command = mock.command;
  }

  TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection()],
  });
  const fixture = TestBed.createComponent(TestHost);
  fixture.detectChanges();

  return { el: fixture.nativeElement as HTMLElement, setLoading: mock.setLoading, fixture };
}

describe('LoadingSpinnerComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('renders nothing when not loading', () => {
    const { el } = setup(false);
    expect(el.querySelector('.ring')).toBeFalsy();
  });

  it('renders the spinner ring when loading', () => {
    const { el } = setup(true);
    expect(el.querySelector('.ring')).toBeTruthy();
  });

  it('has an aria-live region and loading text when active', () => {
    const { el } = setup(true);
    expect(el.querySelector('[aria-live]')).toBeTruthy();
    expect(el.textContent).toContain('Loading…');
  });

  it('shows and then hides the ring as loading changes', () => {
    const { el, setLoading, fixture } = setup(false);

    expect(el.querySelector('.ring')).toBeFalsy();

    setLoading(true);
    fixture.detectChanges();
    expect(el.querySelector('.ring')).toBeTruthy();

    setLoading(false);
    fixture.detectChanges();
    expect(el.querySelector('.ring')).toBeFalsy();
  });
});

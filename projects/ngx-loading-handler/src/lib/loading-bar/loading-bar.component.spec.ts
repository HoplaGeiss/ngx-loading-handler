import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Command } from '../command.models';
import { LoadingBarComponent } from './loading-bar.component';

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
    imports: [LoadingBarComponent],
    template: '<ngx-loading-bar [command]="command" />',
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

describe('LoadingBarComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('renders a bar element', () => {
    const { el } = setup(false);
    expect(el.querySelector('.bar')).toBeTruthy();
  });

  it('does not apply the active class when not loading', () => {
    const { el } = setup(false);
    expect(el.querySelector('.bar.active')).toBeFalsy();
  });

  it('applies the active class when loading', () => {
    const { el } = setup(true);
    expect(el.querySelector('.bar.active')).toBeTruthy();
  });

  it('announces loading state to screen readers', () => {
    const { el } = setup(true);
    expect(el.querySelector('.sr-only')?.textContent).toBe('Loading…');
  });

  it('removes the screen reader text when loading ends', () => {
    const { el, setLoading, fixture } = setup(true);

    expect(el.querySelector('.sr-only')).toBeTruthy();

    setLoading(false);
    fixture.detectChanges();
    expect(el.querySelector('.sr-only')).toBeFalsy();
  });

  it('has an aria-live region', () => {
    const { el } = setup(false);
    expect(el.querySelector('[aria-live]')).toBeTruthy();
  });
});

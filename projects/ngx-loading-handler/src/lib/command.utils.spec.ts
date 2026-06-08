import { of } from 'rxjs';
import { isObservable } from './command.utils';

describe('isObservable', () => {
  it('returns true for an RxJS Observable', () => {
    expect(isObservable(of(1))).toBe(true);
  });

  it('returns true for an object with a subscribe function', () => {
    expect(isObservable({ subscribe: () => {} })).toBe(true);
  });

  it('returns false for a Promise', () => {
    expect(isObservable(Promise.resolve(1))).toBe(false);
  });

  it('returns false for a plain object', () => {
    expect(isObservable({ value: 1 })).toBe(false);
  });

  it('returns false for null', () => {
    expect(isObservable(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isObservable(undefined)).toBe(false);
  });

  it('returns false for a string', () => {
    expect(isObservable('observable')).toBe(false);
  });
});

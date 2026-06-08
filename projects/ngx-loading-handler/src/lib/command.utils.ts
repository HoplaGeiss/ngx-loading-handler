import { Observable } from 'rxjs';

export function isObservable(value: unknown): value is Observable<unknown> {
  return !!value && typeof (value as Record<string, unknown>)['subscribe'] === 'function';
}

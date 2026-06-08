import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { delay, map, throwError } from 'rxjs';
import {
  injectCommand,
  LoadingBarComponent,
  LoadingSpinnerComponent,
} from 'ngx-loading-handler';

@Component({
  selector: 'app-root',
  imports: [LoadingSpinnerComponent, LoadingBarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private http = inject(HttpClient);

  saveCommand = injectCommand(
    () =>
      this.http
        .get<{ id: number; title: string }>(
          'https://jsonplaceholder.typicode.com/todos/1',
        )
        .pipe(delay(1500)),
    {
      onSuccess: () => console.log('Saved!'),
    },
  );

  errorCommand = injectCommand(
    () =>
      this.http
        .get('https://jsonplaceholder.typicode.com/todos/1')
        .pipe(
          delay(1000),
          map(() => {
            throw new Error('Network error: connection refused');
          }),
        ),
    {
      onError: (err) => console.error('Failed:', err),
    },
  );

  barCommand = injectCommand(
    () =>
      this.http
        .get('https://jsonplaceholder.typicode.com/todos/2')
        .pipe(delay(2500)),
  );
}


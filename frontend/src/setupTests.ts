import '@testing-library/jest-dom';
import { vi } from 'vitest';

class MockWorker {
  url: string;
  onmessage: ((e: MessageEvent) => void) | null = null;
  onerror: ((e: Event) => void) | null = null;

  constructor(url: string | URL, _opts?: WorkerOptions) {
    this.url = typeof url === 'string' ? url : url.toString();
  }

  postMessage = vi.fn((msg: unknown) => {
    if (this.onmessage) {
      // Simulate worker responding with initial state
      if (msg === 'START') {
        setTimeout(() => {
          this.onmessage!(
            new MessageEvent('message', {
              data: { type: 'INITIAL_STATE', payload: [] },
            })
          );
        }, 0);
      }
    }
  });

  terminate = vi.fn();
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
  dispatchEvent = vi.fn();
}

vi.stubGlobal('Worker', MockWorker);

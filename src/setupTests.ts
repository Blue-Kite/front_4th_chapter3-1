import { setupServer } from 'msw/node';
import '@testing-library/jest-dom';

import { mockApiHandlers } from './__mocks__/handlers';

/* msw */
export const server = setupServer(...mockApiHandlers);

beforeAll(() => {
  server.listen();
});

beforeEach(() => {
  expect.hasAssertions();
});

afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});

afterAll(() => {
  vi.resetAllMocks();
  server.close();
});

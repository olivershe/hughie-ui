import { render, screen } from '@testing-library/react';
import App from './App';

test('renders header with Hughie.ai text', () => {
  render(<App />);
  const headerElement = screen.getByText(/Hughie.ai/i);
  expect(headerElement).toBeInTheDocument();
});

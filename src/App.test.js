import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Hughie.ai header', () => {
  render(<App />);
  const headerElement = screen.getByText(/Hughie.ai/i);
  expect(headerElement).toBeInTheDocument();
});

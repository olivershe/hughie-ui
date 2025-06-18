import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the Hughie header', () => {
  render(<App />);
  const headerElement = screen.getByText(/hughie\.ai/i);
  expect(headerElement).toBeInTheDocument();
});

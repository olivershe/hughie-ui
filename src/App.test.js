import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Hughie branding', () => {
  render(<App />);
  const branding = screen.getByText(/Hughie.ai/i);
  expect(branding).toBeInTheDocument();
});

import { render, screen } from '@testing-library/react';
import App from './App';

test('renders QaAI landing screen with tagline "Democratising Expertise"', () => {
  render(<App />);
  const tagline = screen.getByTestId('tagline');
  expect(tagline).toBeInTheDocument();
});
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders QaAI landing screen', () => {
  render(<App />);
  const tagline = screen.getByText(/Democratising Expertise/i);
  expect(tagline).toBeInTheDocument();
>>>>>>> 33888b71b17cd1d04f8bb981005aec238d1fc2ec
});


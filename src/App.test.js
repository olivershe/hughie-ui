import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

afterEach(() => {
  localStorage.clear();
});

beforeEach(() => {
  process.env.REACT_APP_OPENAI_API_KEY = 'test';
});

beforeAll(() => {
  Element.prototype.scrollIntoView = jest.fn();
});

test('renders QaAI landing screen with tagline "Democratising Expertise"', () => {
  render(<App />);
  fireEvent.change(screen.getByPlaceholderText('sk-...'), {
    target: { value: 'test-key' }
  });
  fireEvent.click(screen.getByText('Continue'));
  const tagline = screen.getByTestId('tagline');
  expect(tagline).toBeInTheDocument();
});

test('opening a conversation updates the mode badge', async () => {
  const conversations = [
    {
      id: 1,
      title: 'Finance chat',
      messages: [
        { id: 1, type: 'user', content: 'Hello', timestamp: '10:00' }
      ],
      mode: 'finance',
      time: '10:00'
    },
    {
      id: 2,
      title: 'Legal chat',
      messages: [
        { id: 2, type: 'assistant', content: 'Hi', timestamp: '11:00' }
      ],
      mode: 'legal',
      time: '11:00'
    }
  ];

  localStorage.setItem('conversations', JSON.stringify(conversations));

  render(<App />);

  fireEvent.change(screen.getByPlaceholderText('sk-...'), {
    target: { value: 'test-key' }
  });
  fireEvent.click(screen.getByText('Continue'));

  fireEvent.click(screen.getByText('Legal chat'));

  const badges = await screen.findAllByText(/Legal Mode/i);
  expect(badges.length).toBeGreaterThan(0);
});

test('placeholder reflects selected mode on landing screen', () => {
  render(<App />);
  fireEvent.change(screen.getByPlaceholderText('sk-...'), {
    target: { value: 'test-key' }
  });
  fireEvent.click(screen.getByText('Continue'));

  fireEvent.click(screen.getByText('Legal'));

  expect(
    screen.getByPlaceholderText(/Message QaAI in Legal mode/i)
  ).toBeInTheDocument();
});

test('suggestions change when mode is selected', () => {
  render(<App />);
  fireEvent.change(screen.getByPlaceholderText('sk-...'), {
    target: { value: 'test-key' }
  });
  fireEvent.click(screen.getByText('Continue'));

  fireEvent.click(screen.getByText('Finance'));
  expect(screen.getByText(/Savings goal/i)).toBeInTheDocument();

  fireEvent.click(screen.getByText('Legal'));
  expect(screen.getByText(/Contract dispute/i)).toBeInTheDocument();
});

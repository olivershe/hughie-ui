test('renders QaAI landing screen', () => {
  render(<App />);
  const tagline = screen.getByText(/Democratising Expertise/i);
  expect(tagline).toBeInTheDocument();
});


import { render, screen } from '@testing-library/react';
import App from './App.jsx';

test('renders homepage headline', () => {
  render(<App />);
  expect(
    screen.getByRole('heading', {
      name: /choose the doorway that describes you\./i,
    })
  ).toBeInTheDocument();
});

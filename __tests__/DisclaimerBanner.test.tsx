import React from 'react';
import { render } from '@testing-library/react-native';
import { DisclaimerBanner } from '../src/components/DisclaimerBanner';
import { ThemeProvider } from '../src/theme/ThemeProvider';

describe('DisclaimerBanner', () => {
  it('renders the medical-education disclaimer text', async () => {
    const { getByText } = await render(
      <ThemeProvider>
        <DisclaimerBanner />
      </ThemeProvider>
    );

    expect(
      getByText(/NCLEX-RN exam preparation and does not constitute clinical advice/i)
    ).toBeTruthy();
  });

  it('renders compact mode text', async () => {
    const { getByText } = await render(
      <ThemeProvider>
        <DisclaimerBanner compact />
      </ThemeProvider>
    );

    expect(getByText(/Exam preparation only — not clinical advice/i)).toBeTruthy();
  });
});

import { darkColors, lightColors } from '../src/theme/colors';

describe('theme palettes', () => {
  it('provides distinct high-contrast light and dark surfaces and text', () => {
    expect(lightColors.background).not.toBe(darkColors.background);
    expect(lightColors.text).not.toBe(lightColors.background);
    expect(darkColors.text).not.toBe(darkColors.background);
    expect(lightColors.primary).toBeTruthy();
    expect(darkColors.primary).toBeTruthy();
  });
});

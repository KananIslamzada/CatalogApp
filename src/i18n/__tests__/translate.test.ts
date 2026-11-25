import { resolveLocale, translate } from '../translate';

describe('translate', () => {
  it('returns the string for the requested locale', () => {
    expect(translate('az', 'common.retry')).toBe('Yenidən cəhd et');
    expect(translate('en', 'common.retry')).toBe('Try again');
  });

  it('falls back to the key when nothing matches', () => {
    expect(translate('en', 'common.missing' as never)).toBe('common.missing');
  });
});

describe('resolveLocale', () => {
  it('keeps supported languages', () => {
    expect(resolveLocale('az')).toBe('az');
  });

  it('falls back to English for anything else', () => {
    expect(resolveLocale('de')).toBe('en');
    expect(resolveLocale(null)).toBe('en');
    expect(resolveLocale(undefined)).toBe('en');
  });
});

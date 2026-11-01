import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import { Stage } from './Stage';
describe('React stage', () => {
  it('renders live educational text and the correct reaction pose', () => {
    const concepts = renderToStaticMarkup(<Stage time={20} reduced={false} subtitles />);
    expect(concepts).toContain('Prevent unauthorized disclosure.');
    expect(concepts).toContain('Keep resources accessible to authorized users.');
    const alert = renderToStaticMarkup(<Stage time={26} reduced={false} subtitles />);
    expect(alert).toContain('data-pose="surprised"');
    expect(alert).toContain('Something is wrong. Security alert!');
  });
  it('honors the dialogue visibility setting', () => {
    const stage = renderToStaticMarkup(<Stage time={6} reduced subtitles={false} />);
    expect(stage).not.toContain('Every resource must');
  });
});

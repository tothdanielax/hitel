import { describe, expect, it } from 'vite-plus/test';
import { diffFrom, mergeInto } from './object';

const BASE = {
  age: 30,
  name: 'a',
  months: [] as string[],
  settings: { rate: 0.05, offers: [{ id: 'x', rate: 0.06, url: 'https://bank.hu' }] }
};

describe('diffFrom', () => {
  it('is undefined without changes', () => {
    expect(diffFrom(BASE, BASE)).toBeUndefined();
  });
});

describe('mergeInto', () => {
  it('round trips a diff of top-level values', () => {
    const changed = { ...BASE, age: 40, months: ['2027-01'] };
    expect(mergeInto(BASE, diffFrom(changed, BASE))).toEqual(changed);
  });

  it('round trips a diff of a nested value', () => {
    const changed = { ...BASE, settings: { ...BASE.settings, rate: 0.04 } };
    expect(mergeInto(BASE, diffFrom(changed, BASE))).toEqual(changed);
  });

  it('round trips a diff of an object in an array', () => {
    const [offer] = BASE.settings.offers;
    if (!offer) throw new Error('missing test offer');
    const changed = { ...BASE, settings: { ...BASE.settings, offers: [{ ...offer, rate: 0.07 }] } };
    expect(mergeInto(BASE, diffFrom(changed, BASE))).toEqual(changed);
  });

  it('ignores values of the wrong type', () => {
    expect(mergeInto(BASE, { age: 'old' }).age).toBe(30);
  });

  it('ignores non-finite numbers', () => {
    expect(mergeInto(BASE, { age: Number.NaN }).age).toBe(30);
  });

  it('ignores unknown keys', () => {
    expect(mergeInto(BASE, { extra: 1 })).toEqual(BASE);
  });

  it('ignores unknown ids', () => {
    expect(mergeInto(BASE, { settings: { offers: { y: { rate: 1 } } } })).toEqual(BASE);
  });

  it('ignores arrays of objects in place of primitive arrays', () => {
    expect(mergeInto(BASE, { months: [{}] }).months).toEqual([]);
  });
});

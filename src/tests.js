import { diff } from './miniMaple.js'

describe('symbolic differentiation', () => {
  test('4*x^3, x //=> 12*x^2', () => {
    expect(diff('4*x^3', 'x')).toBe('12*x^2');
  });

  test('4*x^3, y // => 0', () => {
    expect(diff('4*x^3', 'y')).toBe('0');
  });

  test('4*x^3-x^2, x //=> 12*x^2 - 2*x', () => {
    expect(diff('4*x^3-x^2', 'x')).toBe('12*x^2 - 2*x');
  });
});
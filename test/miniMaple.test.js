import { MiniMaple, diff } from '../src/miniMaple';

test.each([
    ['4*x^3', 'x', '12*x^2'],
    ['4*x^3', 'y', '0'],
    ['4*x^3-x^2', 'x', '12*x^2 - 2*x'],
    ['7', 'x', '0'],
    ['x', 'x', '1'],
    ['y', 'x', '0'],
    ['x+x', 'x', '2'],
    ['x*x', 'x', '2*x'],
    ['x*y', 'x', 'y'],
    ['(x+1)^3', 'x', '3*(x + 1)^2'],
    ['(x+1)*(x-1)', 'x', 'x - 1 + x + 1'],
    ['-x^2', 'x', '-2*x'],
    ['(-x)^2', 'x', '2*x'],
    ['x-(x^2-x)', 'x', '1 - (2*x - 1)'],
    ['(x^2)^3', 'x', '6*(x^2)^2*x'],
    ['x^0+x^1', 'x', '1'],
    ['0.5*x^2 + 3*x - 5', 'x', 'x + 3'],
    ['foo^2', 'foo', '2*foo'],
    ['x^2^3', 'x', '8*x^7'],
])('diff(%s, %s) = %s', (expression, variable, expected) => {
    expect(MiniMaple.diff(expression, variable)).toBe(expected);
});

test('exports diff for direct use', () => {
    expect(diff('4*x^3', 'x')).toBe('12*x^2');
});

test.each(['x/2', 'sin(x)', 'x^y', 'x^-1', 'x^0.5', 'x+', '(x', 'x)', '2x', '', 'x%2', 'x=1'])
('rejects invalid or unsupported expression %s', expression => {
    expect(() => MiniMaple.diff(expression, 'x')).toThrow();
});

test.each(['', 'x+y', '2', undefined])('rejects invalid variable %s', variable => {
    expect(() => MiniMaple.diff('x', variable)).toThrow();
});

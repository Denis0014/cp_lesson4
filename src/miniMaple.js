const number = value => ({ type: 'number', value });
const binary = (type, left, right) => ({ type, left, right });

function parse(expression) {
    if (typeof expression !== 'string') throw new Error('Expression must be a string');
    const tokens = expression.match(/\d+(?:\.\d*)?|\.\d+|[a-zA-Z_][a-zA-Z_0-9]*|[^\s]/g) || [];
    let position = 0;
    const peek = () => tokens[position];
    const take = () => tokens[position++];

    function atom() {
        const token = take();
        if (token === '(') {
            const result = sum();
            if (take() !== ')') throw new Error('Expected closing parenthesis');
            return result;
        }
        if (/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(token || '')) {
            const value = Number(token);
            if (!Number.isFinite(value)) throw new Error('Number is too large');
            return number(value);
        }
        if (/^[a-zA-Z_][a-zA-Z_0-9]*$/.test(token || '')) {
            return { type: 'variable', name: token };
        }
        throw new Error(`Expected number, variable or parenthesis; got ${token || 'end of expression'}`);
    }

    function power() {
        const base = atom();
        if (peek() !== '^') return base;
        take();
        const exponent = simplify(unary());
        if (exponent.type !== 'number' || !Number.isSafeInteger(exponent.value) || exponent.value < 0) {
            throw new Error('Polynomial powers require a non-negative integer exponent');
        }
        return binary('^', base, exponent);
    }

    function unary() {
        if (peek() === '+') { take(); return unary(); }
        if (peek() === '-') { take(); return binary('*', number(-1), unary()); }
        return power();
    }

    function product() {
        let result = unary();
        while (peek() === '*') {
            take();
            result = binary('*', result, unary());
        }
        return result;
    }

    function sum() {
        let result = product();
        while (peek() === '+' || peek() === '-') {
            const operator = take();
            result = binary(operator, result, product());
        }
        return result;
    }

    const tree = sum();
    if (position !== tokens.length) throw new Error(`Unsupported operation or unexpected token: ${peek()}`);
    return tree;
}

function differentiate(node, variable) {
    const { type, left, right } = node;
    switch (type) {
        case 'number': return number(0);
        case 'variable': return number(node.name === variable ? 1 : 0);
        case '+':
        case '-': return binary(type, differentiate(left, variable), differentiate(right, variable));
        case '*': return binary('+',
            binary('*', differentiate(left, variable), right),
            binary('*', left, differentiate(right, variable)));
        case '^':
            if (right.value === 0) return number(0);
            return binary('*', binary('*', right, binary('^', left, number(right.value - 1))),
                differentiate(left, variable));
        default: throw new Error(`Unsupported operation: ${type}`);
    }
}

function simplify(node) {
    if (node.type === 'number' || node.type === 'variable') return node;
    const left = simplify(node.left);
    const right = simplify(node.right);
    const is = (item, value) => item.type === 'number' && item.value === value;
    if (left.type === 'number' && right.type === 'number') {
        const values = {
            '+': () => left.value + right.value,
            '-': () => left.value - right.value,
            '*': () => left.value * right.value,
            '^': () => left.value ** right.value,
        };
        const value = values[node.type]();
        if (!Number.isFinite(value)) throw new Error('Result is too large');
        return number(value);
    }
    switch (node.type) {
        case '+':
            if (is(left, 0)) return right;
            if (is(right, 0)) return left;
            if (JSON.stringify(left) === JSON.stringify(right)) return simplify(binary('*', number(2), left));
            break;
        case '-':
            if (is(right, 0)) return left;
            if (is(left, 0)) return simplify(binary('*', number(-1), right));
            if (JSON.stringify(left) === JSON.stringify(right)) return number(0);
            break;
        case '*': {
            const factors = [];
            let coefficient = 1;
            function collect(item) {
                if (item.type === '*') { collect(item.left); collect(item.right); }
                else if (item.type === 'number') coefficient *= item.value;
                else factors.push(item);
            }
            collect(left);
            collect(right);
            if (!Number.isFinite(coefficient)) throw new Error('Result is too large');
            if (coefficient === 0) return number(0);
            if (factors.length === 0) return number(coefficient);
            if (coefficient !== 1) factors.unshift(number(coefficient));
            return factors.reduce((result, factor) => binary('*', result, factor));
        }
        case '^':
            if (is(right, 0)) return number(1);
            if (is(right, 1)) return left;
            break;
    }
    return binary(node.type, left, right);
}

function format(node, parentPrecedence = 0) {
    if (node.type === 'number') return String(node.value);
    if (node.type === 'variable') return node.name;
    const precedence = { '+': 1, '-': 1, '*': 2, '^': 3 }[node.type];
    let text;
    if (node.type === '*' && node.left.type === 'number' && node.left.value === -1) {
        text = `-${format(node.right, precedence)}`;
    } else {
        let left = format(node.left, node.type === '^' ? precedence + 1 : precedence);
        if (node.type === '^' && node.left.type === 'number' && node.left.value < 0) left = `(${left})`;
        const right = format(node.right, node.type === '-' ? precedence + 1 : precedence);
        const operator = node.type === '+' || node.type === '-' ? ` ${node.type} ` : node.type;
        text = `${left}${operator}${right}`;
    }
    return precedence < parentPrecedence ? `(${text})` : text;
}

class MiniMaple {
    static diff(expression, variable) {
        if (typeof variable !== 'string' || !/^[a-zA-Z_][a-zA-Z_0-9]*$/.test(variable)) {
            throw new Error('Differentiation variable must be an identifier');
        }
        return format(simplify(differentiate(simplify(parse(expression)), variable)));
    }
}

const diff = (expression, variable) => MiniMaple.diff(expression, variable);

export { MiniMaple, diff };

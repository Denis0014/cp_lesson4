import { diff } from './miniMaple'

document.addEventListener('DOMContentLoaded', setup)

function setup() {
    document.getElementById('calculateButton').onclick = calculateDiff;
}

function calculateDiff() {
    const textInput = document.getElementById('textInput').value;
    const expression = textInput.split(',').map(item => item.trim())[0];
    const variable = textInput.split(',').map(item => item.trim())[1];
    try {
        const result = diff(expression, variable);
        document.getElementById('result').innerHTML = result;
    } catch (error) {
        document.getElementById('result').innerHTML = `Error: ${error.message}`;
    }
}
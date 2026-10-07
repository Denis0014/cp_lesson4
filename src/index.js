import { MiniMaple } from './miniMaple'

document.addEventListener('DOMContentLoaded', setup)

function setup() {
    document.getElementById('calculateButton').onclick = calculateDiff;
}

function calculateDiff() {
    const textInput = document.getElementById('textInput').value;
    const formula = textInput.split(',').map(item => item.trim())[0];
    const variable = textInput.split(',').map(item => item.trim())[1];
    try {
        const result = MiniMaple.diff(formula, variable);
        document.getElementById('result').innerHTML = result;
    } catch (error) {
        document.getElementById('result').innerHTML = `Error: ${error.message}`;
    }
}
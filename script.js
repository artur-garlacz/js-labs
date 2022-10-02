const inputs = document.getElementsByTagName("input");

function getSum(arr) {
  const sumWithInitial = arr.reduce((prev, curr) => prev + curr, 0);

  return sumWithInitial;
}

function getMinMax(arr) {
  return { min: Math.min(...arr), max: Math.max(...arr) };
}

function getAvg(arr) {
  const sum = getSum(arr);
  return sum / arr.length;
}

function getInputValues() {
  const values = [];
  for (input of inputs) {
    values.push(parseInt(input.value || 0));
  }

  return values;
}

function getResultValue() {
  const values = getInputValues();
  const { min, max } = getMinMax(values);

  document.getElementById("result").innerHTML = `Suma: ${getSum(
    values
  )} Min: ${min}, Max: ${max}, Avg: ${getAvg(values)}`;
}

function init() {
  for (input of inputs) {
    input.addEventListener("keyup", (e) => {
      getResultValue();
    });
  }
  getResultValue();
}

document.addEventListener("DOMContentLoaded", () => {
  init();
});

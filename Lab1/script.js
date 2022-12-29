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

  for (let input of inputs) {
    values.push(parseInt(input.value || 0));
  }

  return values;
}

function removeField(e) {
  console.log(e.target.parentNode);
  e.target.parentNode.remove();
  getResultValue();
}

function addNewField() {
  const fieldContainer = document.getElementById("fields");
  const newWrapper = document.createElement("div");
  newWrapper.className = "input";
  const newInp = document.createElement("input");
  newInp.setAttribute("type", "number");
  const newBtn = document.createElement("button");
  newBtn.innerText = "x";

  newInp.addEventListener("keyup", (e) => {
    getResultValue();
  });

  newBtn.addEventListener("click", (e) => {
    removeField(e);
  });

  newWrapper.appendChild(newInp);
  newWrapper.appendChild(newBtn);
  fieldContainer.appendChild(newWrapper);
  getResultValue();
}

function getResultValue() {
  const values = getInputValues();
  const { min, max } = getMinMax(values);

  document.getElementById("result").innerHTML = `Suma: ${getSum(
    values
  )} Min: ${min}, Max: ${max}, Avg: ${getAvg(values)}`;
}

function init() {
  document.getElementById("addNew").addEventListener("click", addNewField);

  const fields = document.querySelectorAll(".input");
  console.log(fields);

  for (let field of fields) {
    field.querySelector("button").addEventListener("click", (e) => {
      removeField(e);
    });
  }

  for (let input of inputs) {
    input.addEventListener("keyup", (e) => {
      getResultValue();
    });
  }

  getResultValue();
}

init();

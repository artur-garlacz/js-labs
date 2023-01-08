// const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

async function measurePerformance(name, cb) {
  console.log(`Start: ${name}`);
  performance.mark("mf-start");
  const result = await cb();
  performance.mark("mf-end");
  const runTime = performance.measure(
    "Czas wykonania kodu",
    "mf-start",
    "mf-end"
  );
  console.log(`Wynik z ${name}: ${result}`);
  console.log(`Czas wykonywania: ${runTime.duration.toFixed(2)}ms`);
}

async function asyncAdd(a, b) {
  console.count("[async add operation]");
  if (typeof a !== "number" || typeof b !== "number") {
    console.log("err", { a, b });
    return Promise.reject("Argumenty muszą mieć typ number!");
  }
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(a + b);
    }, 10);
  });
}

async function addData2(data) {
  console.log("reduce start");
  const resultPromise = data.reduce(async (sumPromise, item) => {
    const sumValue = await sumPromise;
    return asyncAdd(sumValue, item);
  }, 0);
  console.log("reduce end");
  return resultPromise;
}

async function init() {
  const data = Array.from({ length: 100 }, () =>
    Math.floor(Math.random() * 100)
  );
  const result = await measurePerformance("add 2", () => addData2(data), data);
  console.log(result);
}

init();

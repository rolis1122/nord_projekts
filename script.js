const btn = document.querySelector("#btn");
btn.addEventListener("click", () => {
  let file = document.querySelector("#csvFile").files[0];
  if (file === undefined) {
    alert("iepis failu sistēmā!!!");
  } else {
    const reader = new FileReader();
    reader.onload = (event) => {
      const importedText = event.target.result;
      const dataUnsorted = csvToArray(importedText);
      const dataSorted = sortData(dataUnsorted);
      const dataSplitedInDays = sliceDataIntoDays(dataUnsorted);
      console.log(dataUnsorted);
      console.log(dataSplitedInDays);
    };
    reader.readAsText(file);
  }
});

// makes object data from imported CSV file
const csvToArray = (str, delimiter = ",") => {
  const headers = str
    .slice(0, str.indexOf("\n"))
    .replaceAll("ts_", "")
    .trim()
    .split(delimiter);
  const rows = str
    .slice(str.indexOf("\n") + 1)
    .replaceAll("\r", "")
    .trim()
    .split("\n");
  const arr = rows.map((line) => {
    const values = line.split(delimiter);
    const el = headers.reduce((object, header, index) => {
      object[header] = values[index];
      return object;
    }, {});
    return el;
  });
  return arr;
};

// sorts data in ascending order
const sortData = (arr) => {
  const dataSorted = arr.sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.end).getTime()
  );
  return dataSorted;
};

// slices all data into 24h chunks
const sliceDataIntoDays = (arr) => {
  const chunkSize = 24;
  const dataSplitedInDays = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    const oneDayData = arr.slice(i, i + chunkSize);
    dataSplitedInDays.push(oneDayData);
  }
  return dataSplitedInDays;
};

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
      const dataSplitedInDays = sliceDataIntoDays(dataSorted);
      const profit = calculateProfit(dataSplitedInDays);

      // console.log(`Kompūzerī iekačātas ${importedText.length} rindiņas`);
      // console.log(
      //   `Kas sačiņītas ${dataSplitedInDays.length} blokos, kur katrā blokā ir 24 ieraksti`
      // );
      console.log(profit / 1000);

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

const calculateProfit = (arr) => {
  let totalNetto = 0;
  let totalBruto = 0;
  let sadalesTiklaIzmaksas = 0; //Eur/Mwh
  let elektrumDala = 190; //EUR/Mwh
  let DaysOfTransactions = 0;
  for (let i = 0; i < arr.length; i++) {
    let innerarr = arr[i];
    let maxDifPerDay = 0.0;
    for (let x = 0; x < innerarr.length; x++) {
      for (let y = x + 1; y < innerarr.length; y++) {
        //console.log(i, x, y, maxDifPerDay);
        if (
          parseInt(innerarr[x].price) < parseInt(innerarr[y].price) &&
          maxDifPerDay <
            parseInt(innerarr[y].price) - parseInt(innerarr[x].price)
        ) {
          maxDifPerDay =
            parseInt(innerarr[y].price) - parseInt(innerarr[x].price);
          // console.log(
          //   `i=${i} x=${x} y=${y}, maxdiffperday=${maxDifPerDay}, totalbruto${totalBruto}`
          // );
        }
      }
    }
    if (maxDifPerDay > elektrumDala) {
      totalBruto += maxDifPerDay;
      DaysOfTransactions++;
    } else {
      console.log("!!!bizītis šais dienā nenotiek!!!");
    }

    totalNetto =
      totalBruto -
      elektrumDala * DaysOfTransactions -
      sadalesTiklaIzmaksas * arr.length;
    console.log(
      `bruto income in day ${i + 1} = ${
        maxDifPerDay / 1000
      } and total bruto since day1 = ${totalBruto / 1000}`
    );
    console.log(
      `neto income in day${i + 1} = ${
        maxDifPerDay / 1000 - elektrumDala / 1000
      }`
    );
  }

  console.log(
    `totalneto(${totalNetto}) = totalbruto(${totalBruto}) - elektrum(${elektrumDala}) x cikreizes(${arr.length})`
  );

  return totalNetto;
};

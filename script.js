fetchedDataFromCsv = []; // šito kkā vajadzētu ievilkt iekšā un aizvākt no global scope
const onload = fetch("./30.csv")
  .then((res) => {
    return res.text();
  })
  .then((data) => {
    fetchedDataFromCsv.push(data);
    izejasDati = convertTextToArray(fetchedDataFromCsv.toString());
    return sortData(izejasDati);
  });

const btnDrawChart = document.querySelector("#drawChart");
btnDrawChart.addEventListener("click", () => {
  const chunkedArray = chunkArray(izejasDati);
  const incomeDataArray = calcIncomeData(chunkedArray);
  drawChart(incomeDataArray);
  let brutoProfit = calcBrutoPerPeriod(incomeDataArray[0]);
  console.log("bruto profits par visu periodu= " + brutoProfit + " Eur");
  console.log("netto profits par visu periodu= " + incomeDataArray[2] + " Eur");

  const bodyBrutoRef = document.querySelector("#bruto");
  bodyBrutoRef.innerHTML = ` Total bruto profit in range =  ${brutoProfit.toFixed(
    3
  )} Eur`;
  const bodyNetoRef = document.querySelector("#neto");
  bodyNetoRef.innerHTML = ` Total neto profit in range =  ${incomeDataArray[2].toFixed(
    3
  )} Eur. (ja pieņem Elektrum daļu 0.09Eur/Kwh)`;
});

const convertTextToArray = (str, delimiter = ",") => {
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
    const arr = headers.reduce((object, header, index) => {
      object[header] = values[index];
      return object;
    }, {});
    return arr;
  });
  return arr;
};
const sortData = (arr) => {
  arr.sort((a, b) => new Date(a.start).getTime() - new Date(b.end).getTime());
};
const chunkArray = (arr) => {
  const chunkSize = 24;
  const dataSplitedInDays = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    const oneDayData = arr.slice(i, i + chunkSize);
    dataSplitedInDays.push(oneDayData);
  }
  return dataSplitedInDays;
};
const calcIncomeData = (arr) => {
  let xasislabels = [];
  const brutoPerDayArray = [];
  let netoPerDay = 0;
  const elektrum = 0.09;
  for (let i = 0; i < arr.length; i++) {
    let innerarr = arr[i];
    let foudMaxDelta = 0.0;
    for (let x = 0; x < innerarr.length; x++) {
      for (let y = x + 1; y < innerarr.length; y++) {
        if (
          parseInt(innerarr[x].price) < parseInt(innerarr[y].price) &&
          foudMaxDelta <
            parseInt(innerarr[y].price) - parseInt(innerarr[x].price) &&
          parseInt(innerarr[y].price) - parseInt(innerarr[x].price) > 0
        ) {
          foudMaxDelta =
            parseInt(innerarr[y].price) - parseInt(innerarr[x].price);
          // console.log(
          //   `buy=${innerarr[x].start} sell=${innerarr[y].start}, foundMaxDelta = ${foudMaxDelta}`
          // );
        }
      }
    }
    if (foudMaxDelta / 1000 > elektrum) {
      netoPerDay += foudMaxDelta / 1000 - elektrum;
    }

    brutoPerDayArray.push(foudMaxDelta / 1000);
    let dt = new Date(arr[i][0].start);
    let dt2 = dt.getFullYear() + "/" + (dt.getMonth() + 1) + "/" + dt.getDate();

    xasislabels.push(dt2);
    console.log(
      `brutoProfitPerDay @ ${new Date(arr[i][0].start).getDate()}-${
        new Date(arr[i][0].start).getMonth() + 1
      }-${new Date(arr[i][0].start).getFullYear()} = ${
        foudMaxDelta / 1000
      }Eur/Kwh`
    );
  }
  const exportedData = [];
  exportedData.push(brutoPerDayArray, xasislabels, netoPerDay);
  return exportedData;
};
function drawChart(arr) {
  const ctx = document.getElementById("myChart").getContext("2d");
  const myChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: arr[1],
      datasets: [
        {
          label: "nav bizīša",
          data: arr[0].map((value) => {
            return value < 0.09 ? value : null;
          }),
          backgroundColor: ["rgba(255, 99, 132, 0.2)"],
          borderColor: ["rgba(255, 99, 132, 1)"],
          borderWidth: 1,
        },
        {
          label: "ir bizīts",
          data: arr[0].map((value) => {
            return value >= 0.09 ? value : null;
          }),
          backgroundColor: ["green"],
          borderColor: ["rgba(255, 99, 132, 1)"],
          borderWidth: 1,
        },
      ],
    },

    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
        x: {
          categoryPercentage: 1.0,
          barPercentage: 1.0,
          stacked: true,
        },
      },
    },
  });
}
const calcBrutoPerPeriod = (arr) => {
  sum = arr.reduce((a, b) => a + b, 0);
  return sum;
};

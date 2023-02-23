const readUploadedFileAsText = (inputFile) => {
  const temporaryFileReader = new FileReader();

  return new Promise((resolve, reject) => {
    temporaryFileReader.onerror = () => {
      temporaryFileReader.abort();
      reject(new DOMException("Problem parsing input file."));
    };

    temporaryFileReader.onload = () => {
      resolve(temporaryFileReader.result);
    };
    temporaryFileReader.readAsText(inputFile);
  });
};

const handleUpload = async (event) => {
  const file = event.target.files[0];
  const fileContentDiv = document.querySelector("div#file-content");
  try {
    const fileContents = await readUploadedFileAsText(file);

    fileContentDiv.innerHTML = "kaut kas iekačāts";

    importedData.push(fileContents);
  } catch (e) {
    fileContentDiv.innerHTML = e.message;
  }
};

document.querySelector("#csvFile").addEventListener("change", handleUpload);
// -----------------------------//

let importedData = [];
const btnCalc = document.querySelector("#calculate");
btnCalc.addEventListener("click", () => {
  const fullArray = convertTextToArrayWithObjects(importedData.toString());
  console.log(fullArray);
  sortData(fullArray);
  const chunkedArray = chunkArray(fullArray);
  console.log(chunkedArray);
  const brutoProfitData = calculateMaxDiffPerDay(chunkedArray);
  console.log(brutoProfitData);
  drawChart();
  return brutoProfitData;
});

// makes object data from imported CSV file
const convertTextToArrayWithObjects = (str, delimiter = ",") => {
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
  const sortedArray = arr.sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.end).getTime()
  );
};

//slices all data into 24h chunks
const chunkArray = (arr) => {
  const chunkSize = 24;
  const dataSplitedInDays = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    const oneDayData = arr.slice(i, i + chunkSize);
    dataSplitedInDays.push(oneDayData);
  }
  return dataSplitedInDays;
};
// calculates max dif per day
const calculateMaxDiffPerDay = (arr) => {
  let xasislabels = [];
  const brutoPerDay = [];
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
          //);
        }
      }
    }

    brutoPerDay.push(maxDifPerDay / 1000);
    yValues.push(maxDifPerDay / 1000);
    xasislabels.push(arr[i][0].start);
    xlabels.push(arr[i][0].start);
  }
  // console.log(brutoPerDay);
  // console.log(xasislabels);

  return { brutoPerDay, xasislabels };
};

const xlabels = [];
const yValues = [];
function drawChart() {
  const ctx = document.getElementById("myChart").getContext("2d");
  const myChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: xlabels,
      datasets: [
        {
          label: "ir bizītis",
          data: yValues.map((value) => {
            return value < 0.1 ? value : null;
          }),
          backgroundColor: ["rgba(255, 99, 132, 0.2)"],
          borderColor: ["rgba(255, 99, 132, 1)"],
          borderWidth: 1,
        },
        {
          label: "nav bizīša",
          data: yValues.map((value) => {
            return value >= 0.1 ? value : null;
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

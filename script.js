// Global data variable
// Define a global variable to store the loaded CSV data
var csvData;

// Define margin and dimensions for the charts
const margin = {
  top: 20,
  right: 40,
  bottom: 50,
  left: 40,
};

const padding = 20

const width = (window.screen.width - margin.left - margin.right) / 2;
const height = (window.screen.height - margin.top - margin.bottom) / 2;

// Function to start the dashboard
function startDashboard() {
  // Helper functions to load CSV files using D3's d3.json and d3.csv
  function loadCSV(file) {
    return d3.csv(file);
  }

  function importFiles(file1) {
    return Promise.all([loadCSV(file1)]);
  }
  
  importFiles('GamesData.csv').then(function (results) {
    csvData = results[0];

    
    // Convert incomeperperson and alcconsumption data to numbers
    csvData.forEach(function (d) {
      d.tm = +d.tm 
      d.opp_score = +d.opp_score
      d.fg = +d.fg
      d.fga = +d.fga
      d.fg_percentage = + d.fg_percentage
      d.three_points = +d.three_points
      d.three_point_attempts = +d.three_point_attempts
      d.three_point_percentage = +d.three_point_percentage
      d.ft = +d.ft
      d.fta = +d.fta
      d.free_throw_percentage = +d.free_throw_percentage
      d.orb = +d.orb
      d.trb = +d.trb
      d.ast = +d.ast
      d.stl = +d.stl
      d.blk = +d.blk
      d.tov = +d.tov
      d.pf = +d.pf
      d.drb = +d.drb
      d.two_point_percentage = +d.two_point_percentage
    });
    


    // Call functions to create the plots
    // createParallelCoordinates(); //Define width inside this function
    // createDensityPlot(); //Define width inside this function
    createBarCharts();
  })

  };

function createBarCharts(){
  // first make a count for each opponent team of wins and loses.
  wlTable = winsandlosses(csvData)
  wTable = wlTable[0]
  lTable = wlTable[1]

  // wins svg
  const svgW = d3
    .select("#barCharts")
    .append("svg")
    .attr("width", (width - margin.left) / 2 - padding)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${2*margin.left},${margin.top})`);
  // Define scales
  const yScaleW = d3.scaleBand()
    .domain(wTable.map(d => d.name))
    .range([height - margin.top - margin.bottom, 0])
    .padding(0.3);
  const xScaleW = d3.scaleLinear()
    .domain([0, d3.max(wTable, d => d.wins)])
    .nice()
    .range([0, width / 2 - margin.left - margin.right - 100])
  const fillScale = d3.scaleLinear()
    .domain([0,1])
    .range([0, 1]);
  // Create and append the bars
  svgW.selectAll(".bar")
    .data(wTable)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", xScaleW(0))
    .attr("y", d => yScaleW(d.name))
    .transition() // Apply a transition
    .duration(1000)
    .attr("width",d => xScaleW(d.wins))
    .attr("height", yScaleW.bandwidth())
    .attr("fill", d => d3.interpolateGreens(fillScale(d.winsRatio)));
  // Add x-axis
  svgW.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${height - margin.top - margin.bottom})`)
    .call(d3.axisBottom(xScaleW));
  // Add y-axis
  svgW.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(yScaleW));
  // Add X-axis legend
  svgW.append("text")
    .attr("class", "x-axis-legend")
    .attr("x", margin.left)
    .attr("y", height - margin.bottom + 20)
    .text("Games won");
  // Add Y-axis legend
  svgW.append("text")
    .attr("class", "y-axis-legend")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left)
    .text("Teams");

  // losses svg
  const svgL = d3
    .select("#barCharts")
    .append("svg")
    .attr("width", (width - margin.left) / 2 - padding)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${margin.left*2},${margin.top})`);
  // Define scales
  const yScaleL = d3.scaleBand()
    .domain(lTable.map(d => d.name))
    .range([height - margin.top - margin.bottom, 0])
    .padding(0.3);
  const xScaleL = d3.scaleLinear()
    .domain([0, d3.max(lTable, d => d.losses)])
    .nice()
    .range([0, width / 2 - margin.left - margin.right - 100])
  // Create and append the bars
  svgL.selectAll(".bar")
    .data(lTable)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", xScaleW(0))
    .attr("y", d => yScaleL(d.name))
    .transition() // Apply a transition
    .duration(1000)
    .attr("width",d => xScaleL(d.losses))
    .attr("height", yScaleL.bandwidth())
    .attr("fill", d => d3.interpolateReds(fillScale(d.lossesRatio)));
  // Add x-axis
  svgL.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${height - margin.top - margin.bottom})`)
    .call(d3.axisBottom(xScaleL));
  // Add y-axis
  svgL.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(yScaleL));
  svgL.append("text")
    .attr("class", "x-axis-legend")
    .attr("x", margin.left)
    .attr("y", height - margin.bottom + 20)
    .text("Games lost");
  // Add Y-axis legend
  svgL.append("text")
    .attr("class", "y-axis-legend")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left)
    .text("Teams");
}

function winsandlosses(csvData){
  oppDict = {}
  csvData.forEach(element => {
    if(!(element.opp in oppDict)){
      oppDict[element.opp] = {"wins" : 0, "losses" : 0}
    }
    if(element["w/l"] == "W"){
      oppDict[element.opp]["wins"] ++
    }else{
      oppDict[element.opp]["losses"] ++
    }
  });

  // add wins and losses ratio
  csvData.forEach(element => {
    oppDict[element.opp]["winsRatio"] = oppDict[element.opp].wins / (oppDict[element.opp].losses + oppDict[element.opp].wins)
    oppDict[element.opp]["lossesRatio"] = oppDict[element.opp].losses / (oppDict[element.opp].losses + oppDict[element.opp].wins)
  });

  // convert to a table
  const tableOpp = [];
  for (const key in oppDict) {
    if (oppDict.hasOwnProperty(key)) {
      const item = {
        "name": key,
        "wins": oppDict[key].wins,
        "losses" : oppDict[key].losses,
        "winsRatio" : oppDict[key].winsRatio,
        "lossesRatio" : oppDict[key].lossesRatio
      };
      tableOpp.push(item);
    }
  }

  //create one win and one losses sorted tables
  wTable = [...tableOpp].sort((a, b) => a.wins - b.wins);
  lTable = [...tableOpp].sort((a, b) => a.losses - b.losses);

  return [wTable, lTable];
}
// TODO : transcript team code to Name, legends to add, team selection
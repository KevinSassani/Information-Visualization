// Global data variable
// Define a global variable to store the loaded CSV data
var csvData;

// Define margin and dimensions for the charts
const margin = {
  top: 20,
  right: 20,
  bottom: 50,
  left: 80,
};


const width = 500 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

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
  opptable = winsandlosses(csvData)
  const svgW = d3
    .select("#barCharts")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Define scales
  const yScale = d3.scaleBand()
    .domain(opptable.map(d => d.name))
    .range([height - margin.top - margin.bottom, 0])
    .padding(0.3);

  const xScaleW = d3.scaleLinear()
    .domain([0, d3.max(opptable, d => d.wins)])
    .nice()
    .range([0, width - margin.left - margin.right])

  // Create and append the bars
  svgW.selectAll(".bar")
    .data(opptable)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", xScaleW(0))
    .attr("y", d => yScale(d.name))
    .attr("width",d => xScaleW(d.wins))
    .attr("height", yScale.bandwidth());

  // Add x-axis
  svgW.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${height - margin.top - margin.bottom})`)
    .call(d3.axisBottom(xScaleW));

  // Add y-axis
  svgW.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(yScale));
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

  for (const key in oppDict){
    if(oppDict[key].wins == 0 && oppDict[key].losses == 0){
      console.log(key)
    }
  }

  console.log(oppDict["NOK"])

  // convert to a table
  const tableOpp = [];
  for (const key in oppDict) {
    if (oppDict.hasOwnProperty(key)) {
      const item = {
        "name": key,
        "wins": oppDict[key].wins,
        "losses" : oppDict[key].losses
      };
      tableOpp.push(item);
    }
  }
  return tableOpp;
}

// Global data variables
var originalData;
var currentData;
var currentData_parallelCoordinates;
var currentData_barCharts;
var currentData_seasonSlider;

var currentData_barChartHoover;
var currentData_barChartClick;

var currentlyClickedTeam = "non";

var currentData_pointsSlider;
var currentData_pointsSlider2;

// Define global color variables for the parallel coordinates plot
const hooverColor = "black";//"rgb(255,165,0)";//"rgb(0, 104, 71)";
const clickColor = "rgb(0, 178, 243)";//"rgb(0, 104, 71)";
const deselectedColor = "rgb(221, 221, 221)";
const startColor = "rgb(0, 104, 71)";

// Create an object to store your scales
const yScale = {};
const codeToName = {"ATL" : "Atlanta Hawks",
  "BRK" : "Brooklyn Nets",
  "CHA" : "Charlotte Hornets",
  "CHI" : "Chicago Bulls",
  "CHO" : "Charlotte's Hornets",
  "CLE" : "Cleveland Cavaliers",
  "DAL" : "Dallas Mavericks",
  "DEN" : "Denver Nuggets",
  "DET" : "Detroit Pistons",
  "GSW" : "Golden State Warriors",
  "HOU" : "Houston Rockets",
  "IND" : "Indiana Pacers",
  "LAC" : "Los Angeles Clippers",
  "LAL" : "Los Angeles Lakers",
  "MEM" : "Memphis Grizzlies",
  "MIA" : "Miami Heat",
  "MIL" : "Milwaukee Bucks",
  "MIN" : "Minnesota Timberwolves",
  "NJN" : "New Jersey Nets",
  "NOH" : "New Orleans Hornets",
  "NOK" : "New Orleans/Oklahoma City Hornets",
  "NOP" : "New Orleans Pelicans",
  "NYK" : "New York Knicks",
  "OKC" : "Oklahoma City Thunder",
  "ORL" : "Orlando Magic",
  "PHI" : "Philadelphia 76ers",
  "PHO" : "Phoenix Suns",
  "POR" : "Portland Trail Blazers",
  "SAC" : "Sacramento Kings",
  "SAS" : "San Antonio Spurs",
  "SEA" : "Seattle Supersonics",
  "TOR" : "Toronto Raptors",
  "UTA" : "Utah Jazz",
  "WAS" : "Washington Wizards"}
const nameToCode = {} 
for(k in codeToName) nameToCode[codeToName[k]] = k

// Define variable to know if the team is selected or not
const selectedTeams = new Set(Object.keys(codeToName));
var selectAllTeams = true;

// Define margin and dimensions for the charts
const margin = {
  top: 10,
  right: 5,
  bottom: 10,
  left: 5
};

// show team checkbox
function createCheckboxes(){
  var checkboxes = document.getElementById("checkboxes");
  // Select All tick
  const allCheckbox = document.createElement('input');
  allCheckbox.type = 'checkbox';
  allCheckbox.id = "selectAll"
  allCheckbox.checked = true;
  allCheckbox.onchange = () => selectAll();
  const allLabel = document.createElement('label');
  allLabel.htmlFor = "selectAll";
  allLabel.style.fontSize = "0.8vw"
  allLabel.appendChild(allCheckbox);
  allLabel.appendChild(document.createTextNode("Select all"));
  checkboxes.appendChild(allLabel);
  
  // Select for each team
  Object.keys(nameToCode).forEach(key => {
    // Create a checkbox input element
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = key.toLowerCase(); // Set a unique ID for each checkbox
    checkbox.checked = true;
    checkbox.onchange = () => teamChange(nameToCode[key]);
  
    // Create a label element for the checkbox
    const label = document.createElement('label');
    label.style.fontSize = "0.8vw";
    label.htmlFor = key.toLowerCase();
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(key));

    // Append the checkbox and label to the container
    checkboxes.appendChild(label);
  });
}
var expanded = false;
function showCheckboxes(){
  var checkboxes = document.getElementById("checkboxes");
  checkboxes.style.display = "block";
  expanded = true;
  document.getElementById("showhidedbutton").innerText = "Hide"
}
function showHideCheckboxes() {
  var checkboxes = document.getElementById("checkboxes");
  // display or hide checkbox
  if (!expanded) {
    checkboxes.style.display = "block";
    expanded = true;
    document.getElementById("showhidedbutton").innerText = "Hide"
  } else {
    checkboxes.style.display = "none";
    expanded = false;
    document.getElementById("showhidedbutton").innerText = "Show"
  }
}

function highlightTeams(){
  text = document.getElementById("searchBar").value.toLowerCase()
  checkboxes = document.querySelectorAll('input[type="checkbox"]')
  lid = []
  for(var i=0; i<checkboxes.length; i++){
    lid.push(checkboxes[i].id)
  }

  if(text != ""){
    for(var i=0; i<checkboxes.length; i++){
      if(checkboxes[i].id.toLowerCase().startsWith(text)){
        document.getElementById(checkboxes[i].id).parentNode.style.color = "black";
      }else{
        document.getElementById(checkboxes[i].id).parentNode.style.color = "white";
      }
    }
  }else{
    lid.map(id => {
      document.getElementById(id).parentNode.style.color = "white";
    })
  }
}

const width = (window.screen.width - margin.left - margin.right) / 2;
const height = (window.screen.height - margin.top - margin.bottom) / 3;

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
    originalData = results[0];

    // Initialization of the current data sets
    currentData = originalData;
    currentData_parallelCoordinates = originalData;
    currentData_barCharts = originalData;
    currentData_seasonSlider = originalData;
    currentData_barChartHoover = originalData;
    currentData_barChartClick = originalData;
    currentData_pointsSlider = originalData;
    currentData_pointsSlider2 = originalData;


    // Call functions to create the plots
    createSeasonSlider();
    createCheckboxes();
    createParallelCoordinates(); //Define width inside this function
    createDensityPlot(); //Define width inside this function
    createBarCharts();
    createBarChartsLegend();
  })

};

function createSeasonSlider() {

  // Get the container div element
  const containerDiv = document.getElementById("seasonSlider");

  // Get the width and height of the container using getBoundingClientRect()
  const height = containerDiv.getBoundingClientRect().height+70;
  const width = containerDiv.getBoundingClientRect().width - margin.left//- margin.left - margin.right;

  // Define your seasons as numeric values
  const seasons = [2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008, 2007, 2006, 2005, 2004, 2003, 2002];

  // Create a function to convert numeric season values to their original format
  function formatSeason(season) {
    return `${season}-${(season + 1).toString().slice(2)}`;
  }

  // Create the season slider
  const sliderRange = d3
    .sliderBottom()
    .min(d3.min(seasons))
    .max(d3.max(seasons))
    .width(width - 1/8*width)
    .tickFormat(formatSeason) // Use the function to format ticks
    .ticks(20)
    .step(1)
    .default([d3.min(seasons), d3.max(seasons)]);
    

  // Append the slider to the HTML element with id="seasonSlider"
  d3.select('#seasonSlider')
    .append('svg')
    .attr('width', width) // Adjust the width as needed
    .attr('height', height) // Adjust the height as needed
    .attr("class", "seasonSliderStylingClass")
    .append('g')
    .style("transform", `translate(${margin.left}%,25%)`)
    .call(sliderRange);
    

  // Listen to slider changes
  sliderRange.on('onchange', (value) => {
    // 'value' is an array representing the selected range of seasons
    // Update your visualization based on the selected seasons
    // You can access the selected seasons with 'value[0]' and 'value[1]'

    const lowSeason = formatSeason(value[0]);
    const highSeason = formatSeason(value[1]);


    // Filter based on the seasonSlider
    currentData_seasonSlider = originalData.filter((d) => {
      return (d.season >= lowSeason && d.season <= highSeason);
    });

    if (currentlyClickedTeam == "non") {
      currentData = aggregateFilteredData();

      // Call update functions
      updateBarChart(currentData);
      updateParallelCoordinates(currentData);
      updateDensityPlot(currentData);
    } else { // If a team is clicked in bar chart
      currentData = aggregateFilteredData();

      // Call update functions
      updateBarChart(currentData);
      updateDensityPlot(currentData);
      updateParallelCoordinatesPermanentSelectionClick(aggregateFilteredDataPermanentSelection(false));
    }

  });

}

function createBarCharts(){

  // Get the container div element
  const containerDiv = document.getElementById("barCharts");

  // Get the width and height of the container using getBoundingClientRect()
  const width = containerDiv.getBoundingClientRect().width//- margin.left - margin.right;
  const height = containerDiv.getBoundingClientRect().height;


  // first make a count for each opponent team of wins and loses.
  wlTable = winsandlosses(originalData)
  wTable = wlTable[0]
  lTable = wlTable[1]

  // wins svg
  const svgW = d3
    .select("#barCharts")
    .append("svg")
    .attr("width", (width)/2)
    .attr("height", height)
    .append("g")
    .style("transform", `translate(20%,3%)`)
    .attr("id", "winsBarChart")

  // Define scales
  const yScaleW = d3.scaleBand()
    .domain(wTable.map(d => d.name))
    .range([0.9*height, 0])
    .padding(0.3);
  const xScaleW = d3.scaleLinear()
    .domain([0, d3.max(wTable, d => d.wins)])
    .range([0,0.75*(width / 2)])
    .nice();
  const fillScale = d3.scaleLinear()
    .domain([0,1])
    .range([0, 1]);
  // Create and append the bars
  svgW.selectAll(".bar")
    .data(wTable)
    .enter()
    .append("rect")
    .on("mouseover", handleMouseOveBarChart)
    .on("mousemove", handleMouseOveBarChart)
    .on("mouseout", handleMouseOutBarChart)
    .on("click", handleMouseClickBarChart)
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
    .style("transform", `translate(0, ${0.9*height}px)`)
    .call(d3.axisBottom(xScaleW))
    .style("font-family", "Nunito, sans-serif")
    .style("font-size", "0.7vw");
  // Add y-axis
  svgW.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(yScaleW))
    .style("font-family", "Nunito, sans-serif")
    .style("font-size", "0.7vw");
  // Add X-axis legend
  svgW.append("text")
    .attr("class", "x-axis-legend")
    .attr("x", width/8)
    .attr("y", 0.95*height)
    .text("Games won")
    .style("font-family", "Nunito, sans-serif")
    .style("font-size", "0.8vw")
    .style("font-weight", "bold");
    
  // Add Y-axis legend
  svgW.append("text")
    .attr("class", "y-axis-legend")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -width/15)
    .text("Teams")
    .style("font-family", "Nunito, sans-serif")
    .style("font-size", "0.8vw")
    .style("font-weight", "bold");

  // losses svg
  const svgL = d3
    .select("#barCharts")
    .append("svg")
    .attr("width", (width) / 2)
    .attr("height", height)
    .append("g")
    .style("transform", `translate(20%,3%)`)
    .attr("id", "lossesBarChart")
    .attr("transform", `translate(${margin.left + 50},${margin.top})`);
  // Define scales
  const yScaleL = d3.scaleBand()
    .domain(lTable.map(d => d.name))
    .range([0.9*height, 0])
    .padding(0.3);
  const xScaleL = d3.scaleLinear()
    .domain([0, d3.max(lTable, d => d.losses)])
    .nice()
    .range([0, 0.75*(width / 2)])
  // Create and append the bars
  svgL.selectAll(".bar")
    .data(lTable)
    .enter()
    .append("rect")
    .on("mouseover", handleMouseOveBarChart)
    .on("mousemove", handleMouseOveBarChart)
    .on("mouseout", handleMouseOutBarChart)
    .on("click", handleMouseClickBarChart)
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
    .style("transform", `translate(0, ${0.9*height}px)`)
    .call(d3.axisBottom(xScaleL))
    .style("font-family", "Nunito, sans-serif") // Set the font-family
    .style("font-size", "0.7vw");
  // Add y-axis
  svgL.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(yScaleL))
    .style("font-family", "Nunito, sans-serif") // Set the font-family
    .style("font-size", "0.7vw");
  svgL.append("text")
    .attr("class", "x-axis-legend")
    .attr("x", width/8)
    .attr("y", 0.95*height)
    .text("Games lost")
    .style("font-family", "Nunito, sans-serif")
    .style("font-size", "0.8vw") // Set the font-family
    .style("font-weight", "bold");
  // Add Y-axis legend
  svgL.append("text")
    .attr("class", "y-axis-legend")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -width/15)
    .text("Teams")
    .style("font-family", "Nunito, sans-serif") // Set the font-family
    .style("font-size", "0.8vw")
    .style("font-weight", "bold");
}

function createBarChartsLegend(){
  // Get the container div element
  const containerDiv = document.getElementById("winsLegend");

  // Get the width and height of the container using getBoundingClientRect()
  const width = containerDiv.getBoundingClientRect().width //- margin.left
  const height = containerDiv.getBoundingClientRect().height;

  var legendColors = []; // Values from the color scale
  for(var i = 0; i <= 1; i=i+0.01){
    legendColors.push(i)
  }

  // wins legend svg
  const lW = d3
    .select("#winsLegend")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("id", "winsLegendGroup")
    .style("transform", `translate(${width/16}%,${margin.top}%)`)
  lW
    .selectAll("rect")
    .data(legendColors)
    .enter()
    .append("rect")
    .attr("x", (d,i) => i * 2)
    .attr("y", 0)
    .attr("width", 2)
    .attr("height", "2vw")
    .attr("fill", d => d3.interpolateGreens(d));
  lW.append("text")
    .attr("x", width/3)
    .attr("y", height/2)
    .attr("text-anchor", "middle")
    .text("Win Ratio")
    .style("font-family", "Nunito, sans-serif") // Set the font-family
    .style("font-size", "0.8vw")
    .style("font-weight", "bold")
    .style("padding", "10") 
    
  // losses legend svg
  const lL = d3
    .select("#lossesLegend")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("id", "lossesLegendGroup")
    .style("transform", `translate(${width/16}%,${margin.top}%)`)
  lL
    .selectAll("rect")
    .data(legendColors)
    .enter()
    .append("rect")
    .attr("x", (d,i) => i * 2)
    .attr("y", 0)
    .attr("width", 2)
    .attr("height", "2vw")
    .attr("fill", d => d3.interpolateReds(d));
  lL.append("text")
    .attr("x", width/3)
    .attr("y", height/2)
    .attr("text-anchor", "middle")
    .text("Loss Ratio")
    .style("font-family", "Nunito, sans-serif") // Set the font-family
    .style("font-size", "0.8vw")
    .style("font-weight", "bold")
    .style("padding", "10") 
}

function winsandlosses(currentData){
  oppDict = {}
  currentData.forEach(element => {
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
  currentData.forEach(element => {
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

function teamChange(team){
  if(selectedTeams.has(team)){
    selectedTeams.delete(team)
  }else{
    selectedTeams.add(team)
  }
  currentData_barCharts = originalData.filter((d) => {return selectedTeams.has(d.opp)})

  selectAllTeams = false
  document.getElementById("selectAll").checked = false

  if (currentlyClickedTeam == "non") {
    currentData = aggregateFilteredData();

    // Call update functions
    updateBarChart(currentData);
    updateParallelCoordinates(currentData);
    updateDensityPlot(currentData);
  } else { // If a team is clicked in bar chart
    currentData = aggregateFilteredData();

    // Call update functions
    updateBarChart(currentData);
    updateDensityPlot(currentData);
    updateParallelCoordinatesPermanentSelectionClick(aggregateFilteredDataPermanentSelection(false));
  }
}
// TODO : team selection

function selectAll(){
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  if(!selectAllTeams){
    currentData_barCharts = originalData
    Object.keys(codeToName).forEach(element => {
      selectedTeams.add(element)
    });
    for (let i = 0; i < checkboxes.length; i++) {
      checkboxes[i].checked = true;
    }
    selectAllTeams = true
  }else{
    currentData_barCharts = []
    selectedTeams.clear()
    for (let j = 0; j < checkboxes.length; j++) {
      checkboxes[j].checked = false;
    }
    selectAllTeams = false
  }

  if (currentlyClickedTeam == "non") {
    currentData = aggregateFilteredData();

    // Call update functions
    updateBarChart(currentData);
    updateParallelCoordinates(currentData);
    updateDensityPlot(currentData);
  } else { // If a team is clicked in bar chart
    currentData = aggregateFilteredData();

    // Call update functions
    updateBarChart(currentData);
    updateDensityPlot(currentData);
    updateParallelCoordinatesPermanentSelectionClick(aggregateFilteredDataPermanentSelection(false));
  }
}

function createParallelCoordinates() {

  //const width = 600; // - margin.left - margin.right;
  const deselectedColor = "rgb(221, 221, 221)";
  const startColor = "rgb(0, 104, 71)";
  const brushWidth = 50;

  // Get the container div element
  const containerDiv = document.getElementById("parallelCoordinates");

  // Get the width and height of the container using getBoundingClientRect()
  const width = containerDiv.getBoundingClientRect().width;
  const height = containerDiv.getBoundingClientRect().height;

  const svg = d3
    .select("#parallelCoordinates")
    .append("svg")
      .attr("width", width)
      .attr("height", height)
    .append("g")
      .style("transform", `translate(${margin.left}%,${margin.top}%)`)

  // Choose dimensions to include in the plot
  dimensions = ["fg_percentage", "free_throw_percentage", "ast", "orb", "drb", "stl", "blk"];

  

  // For each dimension, build a linear scale
  dimensions.forEach(function(dimension) {
    // Get the min and max values for the dimension
    const min = d3.min(originalData, d => +d[dimension]);
    const max = d3.max(originalData, d => +d[dimension]);

    // Create a linear scale for the dimension
    const scale = d3.scaleLinear()
      .domain([min, max])
      .range([0.85*height, 0]); 

    // Store the scale in the yScale
    yScale[dimension] = scale;
  });

  xScale = d3.scalePoint()
    .range([0, 0.9*width])
    .domain(dimensions);

  // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
  function path(d) {
    return d3.line()(dimensions.map(function(p) { return [xScale(p), yScale[p](d[p])]; }));
  }

  // Draw the lines
  svg.selectAll("path")
    .data(originalData)
    .join("path")
      .attr("class", function (d) { return "line season-" + d.season } ) // 2 class for each line: 'line' and the group name
      .attr("d",  (d) => path(d))
      .style("fill", "none" )
      .style("stroke", startColor)//function(d){ return( colorScale(d.season))} )
      .style("opacity", 0.5);

    const dimensionMapping = {
      "fg_percentage": "Field-goal %",
      "free_throw_percentage": "Free-throw %",
      "ast": "Assist",
      "orb": "Offensive rebound",
      "drb": "Defensive rebound",
      "stl": "Steal",
      "blk": "Block"
    };
  
  function mapDimensionToAxisLabelValue(dimension) {
    return dimensionMapping[dimension] || dimension;
  }
  
  // Draw the axis:
  svg.selectAll("myAxis")
  // For each dimension of the dataset I add a 'g' element:
  .data(dimensions).enter()
  .append("g")
  .attr("class", "axisParallel")
  // I translate this element to its right position on the x axis
  .attr("transform", function(d) { return "translate(" + xScale(d) + ")"; })
  .on("mouseover", showTooltipParallel)
  .on("mousemove", showTooltipParallel)
  .on("mouseleave", hideTooltip)
  .style("font-size", "0.7vw")
  // And I build the axis with the call function
  .each(function(d) {
    // Calculate the min and max values for the current dimension
    var minVal = d3.min(originalData, p => +p[d]);
    var maxVal = d3.max(originalData, p => +p[d]);

    // Create a scale for the current axis
    var axisScale = d3.scaleLinear()
      .domain([minVal, maxVal])
      .range([height, 0]);

    // Create the axis with only the min and max ticks
    var axis = d3.axisLeft().scale(yScale[d]).tickValues([minVal, maxVal]);

    d3.select(this).call(axis)
      
  });

  // Create a group for the axis labels
  svg.append("g")
  .selectAll("text")
  .data(dimensions)
  .enter()
  .append("text")
  .attr("class", "axis-label")
  .attr("x", function (d) {
    return xScale(d);
  })
  .attr("y", -9)
  .style("text-anchor", "middle")
  .text(function (d) {
    return mapDimensionToAxisLabelValue(d);
  })
  .style("fill", "black")
  .style("font-family", "Nunito, sans-serif")
  .style("font-size", "0.8vw")
  .style("font-weight", "bold");
 
  // Create the brush behavior along the y-axis.
   const brushes = []; // Create an array to store the brush instances

   // Create the brushes for each axis
   dimensions.forEach((key) => {
     const brush = d3.brushY()
       .extent([
         [-(brushWidth / 2), 0],
         [brushWidth / 2, height]
       ])
       .on("start brush end", function (event) {
         brushed(event, key, originalData);
       });
   
     brushes.push(brush); // Store the brush in the array
   });
   
   // Attach the brushes to the axes
   const axes = svg.selectAll(".axisParallel");
   axes.each(function (d, i) {
     d3.select(this).call(brushes[i]); // Use the appropriate brush from the array
   });
 
}

function showTooltipParallel(event, dimension) {
  // Get the mouse position
  const [x, y] = [event.pageX, event.pageY];

  // Invert the y-coordinate to find the corresponding axis value
  const axisValue = yScale[dimension].invert(y - margin.top - margin.bottom -55);

  let tooltip = d3.select("#tooltip");
  // Set the tooltip text and position
  tooltip
    .text(`${axisValue.toFixed(2)}`) // Format the axis value as needed
    .style("left", x + "px")
    .style("top", (y - 30) + "px")
    .style("font-family", "Nunito, sans-serif"); // Adjust the vertical position of the tooltip

  // Show the tooltip
  tooltip.style("opacity", 1);
}


function createDensityPlot() {
  // Get the container div element
  const containerDiv = document.getElementById("densityPlotFigure");

  // Get the width and height of the container using getBoundingClientRect()
  const width = containerDiv.getBoundingClientRect().width;
  const height = containerDiv.getBoundingClientRect().height;

  var svg = d3.select("#densityPlotFigure")
    .append("svg")
    .attr("width", width)
    .attr("height", "100%") // Set the height to 100% of the parent container
    .append("g")
    .style("transform", `translate(${margin.left}%,${margin.top}%)`)
  
  const heightSlidder = document.getElementById("densityPlotSliderContainer").getBoundingClientRect().height
  var sliderContainer = d3.select("#slider-tm").classed("slider-container", true);
    
  var sliderSvg = sliderContainer.append("svg")
    //.attr("id", "slider")
    .attr("width", "100%")
    .attr("height", heightSlidder/2)
    .style("transform", "translate(5%,25%)")
  
  const sliderRange = d3
    .sliderBottom()
    .min(d3.min(originalData, d => Math.min(d.tm, d.opp_score)))
    .max(d3.max(originalData, d => Math.max(d.tm, d.opp_score)))
    .width(0.9*width)
    .default([d3.min(originalData, d => Math.min(d.tm, d.opp_score))+1, d3.max(originalData, d => Math.max(d.tm, d.opp_score))])
    .fill('#007A33')
    .step(1)
    .ticks(0);
  
  sliderRange.on('onchange', val => {
    //x.domain(val);
    minSliderValue = val[0];
    maxSliderValue = val[1];
    redrawDensityPlot('tm', minSliderValue, maxSliderValue);
    currentData_pointsSlider = originalData.filter((d) => {
      return (d.tm >= minSliderValue && d.tm <= maxSliderValue);
    });
    
    if (currentlyClickedTeam == "non") {
      currentData = aggregateFilteredData();

      // Call update functions
      updateBarChart(currentData);
      updateParallelCoordinates(currentData);
    } else { // If a team is clicked in bar chart
      currentData = aggregateFilteredData();

      // Call update functions
      updateBarChart(currentData);
      updateParallelCoordinatesPermanentSelectionClick(aggregateFilteredDataPermanentSelection(false));
    }
  });

  sliderSvg.call(sliderRange);

  var sliderContainer = d3.select("#slider-opp_score").classed("slider-container", true);

  var sliderSvg2 = sliderContainer.append("svg")
    //.attr("id", "slider")
    .attr("width", "100%")
    .attr("height", heightSlidder/2)
    .style("transform", "translate(5%,5%)");
  min = d3.min(originalData, d => Math.min(d.tm, d.opp_score));

  const sliderRange2 = d3
    .sliderBottom()
    .min(d3.min(originalData, d => Math.min(d.tm, d.opp_score)))
    .max(d3.max(originalData, d => Math.max(d.tm, d.opp_score)))
    .width(0.9*width)
    .default([d3.min(originalData, d => Math.min(d.tm, d.opp_score))+1, d3.max(originalData, d => Math.max(d.tm, d.opp_score))])
    .step(1)
    .fill('#404080');

  sliderRange2.on('onchange', val2 => {
    minSliderValue2 = val2[0];
    maxSliderValue2 = val2[1];
    redrawDensityPlot('opp_score', minSliderValue2, maxSliderValue2);
    currentData_pointsSlider2 = originalData.filter((d) => {
      return (d.opp_score >= minSliderValue2 && d.opp_score <= maxSliderValue2);
    });
    
    if (currentlyClickedTeam == "non") {
      currentData = aggregateFilteredData();

      // Call update functions
      updateBarChart(currentData);
      updateParallelCoordinates(currentData);
    } else { // If a team is clicked in bar chart
      currentData = aggregateFilteredData();

      // Call update functions
      updateBarChart(currentData);
      updateParallelCoordinatesPermanentSelectionClick(aggregateFilteredDataPermanentSelection(false));
    }
  });

  sliderSvg2.call(sliderRange2);

  var x = d3.scaleLinear()
    .domain([min,
      d3.max(originalData, function (d) { return Math.max(d.tm, d.opp_score); })
    ])
    .nice()
    .range([0, 0.9*width]);

  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + 0.8*height + ")")
    .style("font-size", "0.7vw")
    .call(d3.axisBottom(x));

  var y = d3.scaleLinear()
    .range([0.8*height, 0])
    .domain([0, 0.1])
    .nice();
  
  svg.append("g")
    .attr("class", "y-axis")
    .attr("transform", "translate(0, 0)") // Adjust the second parameter for the desired height
    .style("font-size", "0.7vw")
    .call(d3.axisLeft(y));
  

  function kernelDensityEstimator(kernel, X) {
    return function (V) {
      return X.map(function (x) {
        return [x, d3.mean(V, function (v) { return kernel(x - v); })];
      });
    }
  }

  function kernelEpanechnikov(k) {
    return function (v) {
      return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
    };
  }

  function redrawDensityPlot(dataField, min, max) {

    const fieldToFilter = dataField === 'tm' ? 'tm' : 'opp_score';

    // Filter the data based on the selected field
    const filteredData = originalData.filter(d => d[fieldToFilter] >= min && d[fieldToFilter] <= max); 

    // Calculate the max and min values for the filtered "tm" data
    var xFiltered = d3.scaleLinear()
      .domain([40, 160]) // Fixed x-axis domain
      .nice()
      .range([0, width]);
    
    // Update the x-axis domain
    
    
    var kde = kernelDensityEstimator(kernelEpanechnikov(7), xFiltered.ticks(60));
    var density = kde(filteredData.map(function (d) {
    return d[dataField];
  }));

    

    svg.select(".mypath-" + dataField)
      .datum(density)
      .transition()
      .duration(300)
      .attr("d", d3.line()
        .curve(d3.curveBasis)
        .x(function (d) { return xFiltered(d[0]); })
        .y(function (d) { return y(d[1]); })
      );
    
  }

  // Create the initial density plots for both 'tm' and 'opp_score'
  createInitialDensityPlot('tm');
  createInitialDensityPlot('opp_score');

  function createInitialDensityPlot(dataField) {
    var kde = kernelDensityEstimator(kernelEpanechnikov(7), x.ticks(60));
    var density = kde(originalData.map(function (d) {
      return d[dataField]; // 'tm' or 'opp_score'
    }));

    var xFiltered = d3.scaleLinear()
      .domain([40, 160]) // Fixed x-axis domain
      .nice()
      .range([0, width]);

    svg.append("path")
      .attr("class", "mypath-" + dataField)
      .datum(density)
      .attr("fill", dataField === 'tm' ? "#007A33" : "#404080")
      .attr("opacity", ".6")
      .attr("stroke", "#000")
      .attr("stroke-width", 1)
      .attr("stroke-linejoin", "round")
      .attr("d", d3.line()
        .curve(d3.curveBasis)
        .x(function (d) { return xFiltered(d[0]); })
        .y(function (d) { return y(d[1]); })
      );

    // Add legend
    svg.append("circle").attr("cx", width/2).attr("cy", height/11).attr("r", 6).style("fill", "#69b3a2");
    svg.append("text").attr("x", width/2+12).attr("y", height/10).text("Boston Celtics score").style("font-size", "0.8vw").attr("alignment-baseline", "middle").style("font-family", "Nunito, sans-serif");

    svg.append("circle").attr("cx", width/2).attr("cy", height/7).attr("r", 6).style("fill", "#404080");
    svg.append("text").attr("x", width/2 + 12).attr("y", height/6).text("Opponent score").style("font-size", "0.8vw").attr("alignment-baseline", "middle").style("font-family", "Nunito, sans-serif");

  }

}

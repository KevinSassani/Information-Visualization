// Global data variable
// Define a global variable to store the loaded CSV data
var originalData;
var currentData;
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
  top: 30,
  right: 50,
  bottom: 30,
  left: 50
};

// show team checkbox
var expanded = false;
function showCheckboxes() {
  var checkboxes = document.getElementById("checkboxes");
  // Select All tick
  const allCheckbox = document.createElement('input');
  allCheckbox.type = 'checkbox';
  allCheckbox.id = "selectAll"
  allCheckbox.checked = true;
  allCheckbox.onchange = () => selectAll();
  const allLabel = document.createElement('label');
  allLabel.htmlFor = "selectAll";
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
    label.htmlFor = key.toLowerCase();
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(key));

    // Append the checkbox and label to the container
    checkboxes.appendChild(label);
  });
  // display or hide checkbox
  if (!expanded) {
    checkboxes.style.display = "block";
    expanded = true;
  } else {
    checkboxes.style.display = "none";
    expanded = false;
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
    currentData = originalData;

    /*
    // Convert incomeperperson and alcconsumption data to numbers
    originalData.forEach(function (d) {
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
    */


    // Call functions to create the plots
    createParallelCoordinates(); //Define width inside this function
    // createDensityPlot(); //Define width inside this function
    createBarCharts();
  })

  };

function createBarCharts(){

  // Get the container div element
  const containerDiv = document.getElementById("barCharts");

  // Get the width and height of the container using getBoundingClientRect()
  const width = containerDiv.getBoundingClientRect().width - margin.left - margin.right;
  const height = containerDiv.getBoundingClientRect().height - margin.top - margin.bottom;

  const padding = 30

  // first make a count for each opponent team of wins and loses.
  wlTable = winsandlosses(currentData)
  wTable = wlTable[0]
  lTable = wlTable[1]

  // wins svg
  const svgW = d3
    .select("#barCharts")
    .append("svg")
    .attr("width", (width)/2)
    .attr("height", height)
    .append("g")
    .attr("id", "winsBarChart")
    .attr("transform", `translate(${50 + margin.left},${margin.top})`);
  // Define scales
  const yScaleW = d3.scaleBand()
    .domain(wTable.map(d => d.name))
    .range([height - margin.top - margin.bottom, 0])
    .padding(0.3);
  const xScaleW = d3.scaleLinear()
    .domain([0, d3.max(wTable, d => d.wins)])
    .range([0, width / 2 - margin.left - margin.right - 10])
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
    .on("mouseout", handleMouseOutBarChart)
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
    .call(d3.axisBottom(xScaleW))
    .style("font-family", "Nunito, sans-serif");
  // Add y-axis
  svgW.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(yScaleW))
    .style("font-family", "Nunito, sans-serif");
  // Add X-axis legend
  svgW.append("text")
    .attr("class", "x-axis-legend")
    .attr("x", margin.left)
    .attr("y", height - margin.bottom + 20)
    .text("Games won")
    .style("font-family", "Nunito, sans-serif");
    
  // Add Y-axis legend
  svgW.append("text")
    .attr("class", "y-axis-legend")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left)
    .text("Teams")
    .style("font-family", "Nunito, sans-serif");

  // losses svg
  const svgL = d3
    .select("#barCharts")
    .append("svg")
    .attr("width", (width) / 2)
    .attr("height", height)
    .append("g")
    .attr("id", "lossesBarChart")
    .attr("transform", `translate(${margin.left + 50},${margin.top})`);
  // Define scales
  const yScaleL = d3.scaleBand()
    .domain(lTable.map(d => d.name))
    .range([height - margin.top - margin.bottom, 0])
    .padding(0.3);
  const xScaleL = d3.scaleLinear()
    .domain([0, d3.max(lTable, d => d.losses)])
    .nice()
    .range([0, width / 2 - margin.left - margin.right - 10])
  // Create and append the bars
  svgL.selectAll(".bar")
    .data(lTable)
    .enter()
    .append("rect")
    .on("mouseover", handleMouseOveBarChart)
    .on("mouseout", handleMouseOutBarChart)
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
    .call(d3.axisBottom(xScaleL))
    .style("font-family", "Nunito, sans-serif") // Set the font-family
  // Add y-axis
  svgL.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(yScaleL))
    .style("font-family", "Nunito, sans-serif") // Set the font-family
  svgL.append("text")
    .attr("class", "x-axis-legend")
    .attr("x", margin.left)
    .attr("y", height - margin.bottom + 20)
    .text("Games lost")
    .style("font-family", "Nunito, sans-serif") // Set the font-family
  // Add Y-axis legend
  svgL.append("text")
    .attr("class", "y-axis-legend")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left)
    .text("Teams")
    .style("font-family", "Nunito, sans-serif") // Set the font-family
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
  currentData = originalData.filter((d) => {return selectedTeams.has(d.opp)})
  selectAllTeams = false
  document.getElementById("selectAll").checked = false
  updateBarChart(currentData)
  updateParallelCoordinates(currentData)
}
// TODO : team selection

function selectAll(){
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  if(!selectAllTeams){
    currentData = originalData
    Object.keys(codeToName).forEach(element => {
      selectedTeams.add(element)
    });
    for (let i = 0; i < checkboxes.length; i++) {
      checkboxes[i].checked = true;
    }
    selectAllTeams = true
  }else{
    currentData = []
    selectedTeams.clear()
    for (let j = 0; j < checkboxes.length; j++) {
      checkboxes[j].checked = false;
    }
    selectAllTeams = false
  }
  updateBarChart(currentData)
  updateParallelCoordinates(currentData)
}
  
function createParallelCoordinates() {

  //const width = 600; // - margin.left - margin.right;
  const deselectedColor = "rgb(221, 221, 221)";
  const brushWidth = 50;

  // Get the container div element
  const containerDiv = document.getElementById("parallelCoordinates");

  // Get the width and height of the container using getBoundingClientRect()
  const width = containerDiv.getBoundingClientRect().width - margin.left - margin.right;
  const height = containerDiv.getBoundingClientRect().height - margin.top - margin.bottom;

  const svg = d3
    .select("#parallelCoordinates")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.bottom + margin.top)
    .append("g")
      .attr("transform",`translate(${margin.left},${margin.top})`);

  // Color scale: different colors for each season
  var customColors = [
    "#007A33", // Boston Celtics' green
    "#BA9653", // Custom color 2
    "#FFFFFF", // White
    "#000000", // Black
    "#C8102E", // Another shade of green
    "#D13870", // Another shade of green
    "#D6A06F", // A light brownish color
    "#007-DC3", // Another shade of green
    "#B7A248", // A yellowish color
    "#4A90E2", // A blue color
    "#E03A3E", // A bright red color
    "#FFA25D", // An orange color
    "#6C6073", // A dark gray color
    "#D7C6BB", // A light gray color
    "#FF5736", // A bright orange color
    "#00B2A9", // A teal color
    "#4F0D3E", // A dark purple color
    "#E2D1C3", // A light peach color
    "#00A79D", // Another shade of teal
    "#706962", // A dark olive green color
    "#FDB927"  // A bright yellow color
  ];

  var colorScale = d3.scaleOrdinal()
    .domain(["2022-23", "2021-22", "2020-21", "2019-20", "2018-19", "2017-18", "2016-17", "2015-16", "2014-15", "2013-14", "2012-13", "2011-12", "2010-11", "2009-10", "2008-09", "2007-08", "2006-07", "2005-06", "2004-05", "2003-04", "2002-03"])
    .range(customColors);
    //.range(getHueScaleColors(20, 50, 300));

  /*
  var colors = d3.scaleSequential()
  .domain([0, 1]) // Define a dummy domain from 0 to 1
  .interpolator(d3.interpolateBrBG); // Use the interpolation function

  var domainValues = ["2022-23", "2021-22", "2020-21", "2019-20", "2018-19", "2017-18", "2016-17", "2015-16", "2014-15", "2013-14", "2012-13", "2011-12", "2010-11", "2009-10", "2008-09", "2007-08", "2006-07", "2005-06", "2004-05", "2003-04", "2002-03"];

  var colorScale = d3.scaleOrdinal()
    .domain(domainValues)
    .range(domainValues.map(function(value, index, array) {
      return colors(index / (array.length - 1));
    }));
*/

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
      .range([height, 0]); 

    // Store the scale in the yScale
    yScale[dimension] = scale;
  });

  xScale = d3.scalePoint()
    .range([0, width])
    .domain(dimensions);

  // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
  function path(d) {
    return d3.line()(dimensions.map(function(p) { return [xScale(p), yScale[p](d[p])]; }));
  }

  // Draw the lines
  svg.selectAll("path")
    .data(originalData)
    .enter()
    .append("path")
      .attr("class", function (d) { return "line season-" + d.season } ) // 2 class for each line: 'line' and the group name
      .attr("d",  (d) => path(d))
      .style("fill", "none" )
      .style("stroke", function(d){ return( colorScale(d.season))} )
      .style("opacity", 0.5)
      .on("mouseover", function(event,d) {
        // Check if the line is active (matches all selections)
        const isActive = d3.select(this).style("stroke") !== deselectedColor;
        
        // Show the tooltip only if the line is active
        if (isActive) {
          showTooltip(event, d);
        }
      })
      .on("mouseleave", hideTooltip )

    const dimensionMapping = {
      "fg_percentage": "Field-goal %",
      "free_throw_percentage": "Free-throw %",
      "ast": "Assist",
      "orb": "Offensive rebound",
      "drb": "Defensive rebound",
      "stl": "Steal",
      "blk": "Block"
    };
  
  function mapDimensionToTickValue(dimension) {
    return dimensionMapping[dimension] || dimension;
  }
  

  // Draw the axis:
  svg.selectAll("myAxis")
    // For each dimension of the dataset I add a 'g' element:
    .data(dimensions).enter()
    .append("g")
    .attr("class", "axis")
    // I translate this element to its right position on the x axis
    .attr("transform", function(d) { return "translate(" + xScale(d) + ")"; })
    // And I build the axis with the call function
    .each(function(d) { d3.select(this).call(d3.axisLeft().ticks(5).scale(yScale[d])); })
    // Add axis title
    .append("text")
      .style("text-anchor", "middle")
      .attr("y", -9)
      .text((d) => mapDimensionToTickValue(d))
      .style("fill", "black")
      .style("font-family", "Nunito, sans-serif");


  
/*
  const brush = d3.brushY()
    .extent([
      [-(brushWidth / 2), 0],
      [brushWidth / 2, height]
    ])
    .on("start brush end", function (event) {
      console.log(event)
    });// => brushed(event, key, originalData));
    //.on("start brush end", brushed);
    
    */
 
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
   const axes = svg.selectAll(".axis");
   axes.each(function (d, i) {
     d3.select(this).call(brushes[i]); // Use the appropriate brush from the array
   });

/*
  const axes = svg.selectAll(".axis");
  axes.call(brush);
  */
 
}

 // Function to show tooltip
 function showTooltip(event, d) {

  season = d.season

  // Create or select the tooltip element
  let tooltip = d3.select("#tooltip");

  // Show the tooltip
  tooltip.transition().duration(10).style("opacity", 0.9);

  // Position the tooltip at the cursor
  tooltip.style("left", (event.pageX + 10) + "px")
    .style("top", (event.pageY - 20) + "px");

  // Set the tooltip text
  tooltip.text(`Season: ${season}\nOpponent: ${d.opp}`);
}

// Function to hide the tooltip
function hideTooltip() {
  // Hide the tooltip
  d3.select("#tooltip").transition().duration(800).style("opacity", 0);
}




function getHueScaleColors(count, startHue, endHue) {
  const colors = [];

  for (let i = 0; i < count; i++) {
    // Generate hue within the specified range
    const hue = startHue + ((endHue - startHue) * (i / count));

    // Set constant saturation and value
    const saturation = 90;
    const value = 90;

    // Convert HSV to RGB
    const chroma = (value / 100) * (saturation / 100);
    const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
    const m = value / 100 - chroma;

    let r, g, b;
    if (hue >= 0 && hue < 60) {
      r = chroma;
      g = x;
      b = 0;
    } else if (hue >= 60 && hue < 120) {
      r = x;
      g = chroma;
      b = 0;
    } else if (hue >= 120 && hue < 180) {
      r = 0;
      g = chroma;
      b = x;
    } else if (hue >= 180 && hue < 240) {
      r = 0;
      g = x;
      b = chroma;
    } else if (hue >= 240 && hue < 300) {
      r = x;
      g = 0;
      b = chroma;
    } else {
      r = chroma;
      g = 0;
      b = x;
    }

    // Convert RGB values to integers
    const red = Math.floor((r + m) * 255);
    const green = Math.floor((g + m) * 255);
    const blue = Math.floor((b + m) * 255);

    // Create an RGB color string
    const color = `rgb(${red},${green},${blue}`;

    colors.push(color);
  }

  return colors;
}

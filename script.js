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


//const width = 500 - margin.left - margin.right;
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

    /*
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
    */


    // Call functions to create the plots
    createParallelCoordinates(csvData); //Define width inside this function
    createDensityPlot(); //Define width inside this function
  })

  }

  
function createParallelCoordinates(csvData) {

  const width = 600; // - margin.left - margin.right;
  const deselectedColor = "rgb(221, 221, 221)";
  const brushWidth = 50;

  const svg = d3
    .select("#parallelCoordinates")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.bottom + margin.top)
    .append("g")
      .attr("transform",
            `translate(${margin.left},${margin.top})`);

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

  
  // Create an object to store your scales
  const yScale = {};

  // For each dimension, build a linear scale
  dimensions.forEach(function(dimension) {
    // Get the min and max values for the dimension
    const min = d3.min(csvData, d => +d[dimension]);
    const max = d3.max(csvData, d => +d[dimension]);

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
    tooltip.text(season);
  }

  // Function to hide the tooltip
  function hideTooltip() {
    // Hide the tooltip
    d3.select("#tooltip").transition().duration(800).style("opacity", 0);
  }



  // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
  function path(d) {
    return d3.line()(dimensions.map(function(p) { return [xScale(p), yScale[p](d[p])]; }));
  }

  // Draw the lines
  svg.selectAll("path")
    .data(csvData)
    .join("path")
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
      .style("fill", "black");


  // Create the brush behavior along the y-axis.

  const brush = d3.brushY()
    .extent([
      [-(brushWidth / 2), 0],
      [brushWidth / 2, height]
    ])
    .on("start brush end", brushed);
 
   // Attach the brush to the axes
  const axes = svg.selectAll(".axis");
  axes.call(brush);
 
  const selections = new Map();
 
  function brushed({ selection }, key) {
    if (selection === null) selections.delete(key);
    else selections.set(key, selection.map(yScale[key].invert));
 
    const selected = [];
 
    // Iterate through the paths and update their appearance based on the selection
    svg.selectAll(".line")
    .each(function(d) {
      // Initialize an 'active' flag to true
      let active = true;
      
      // Check for each selection whether the data point falls within the range
      Array.from(selections).forEach(([key, [max, min]]) => {
        const value = +d[key];
        min = +min
        max = +max
        
        if (!(value >= min && value <= max)) {
          active = false; // Set 'active' to false if any selection matches
        } 
      
      });
  
      // Update the line's appearance based on the 'active' flag
      d3.select(this)
        .style("stroke", active ? colorScale(d.season) : deselectedColor);
  
      if (active) {
        d3.select(this).raise();
        selected.push(d);
      }
      d3.selectAll(".brush").raise();
    });
     
 
     // Dispatch an event with the selected data
     svg.property("value", selected).dispatch("input");
   }
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

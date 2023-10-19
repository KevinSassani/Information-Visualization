
// Function to handle mouseover event in barchars viz
function handleMouseOveBarChart(event, item) {
  // Select all elements with class "data" and filter based on the item's properties
  d3.select("#barCharts")
    .selectAll(".bar")
    .filter(function (d) {
      // Check if "properties" exist in both item and d objects
      return item.name == d.name
    })
    .attr("stroke", "black")
    .attr("stroke-width","2px")
    .append("title")
    .text(d => `team : ${codeToName[d.name]}\nwins : ${d.wins}, losses : ${d.losses}\nwins ratio : ${d.winsRatio.toFixed(2)}`); // Change the fill color of the matching elements to red
}

function handleMouseOutBarChart(event, item){
  d3.select("#barCharts")
    .selectAll(".bar")
    .attr("stroke", "none")
}


// Brushing functionality of the parallel coordinates plot
const selections = new Map();
 
function brushed({ selection }, key, data) {
  const deselectedColor = "rgb(221, 221, 221)";
  const startColor = "rgb(0, 104, 71)";
  const brushWidth = 50;

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

    /*
  // Create an object to store your scales
  const yScale = {};

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

  */

  /*
  const yScale = createYScale(data, dimensions);
  */

  if (selection === null) selections.delete(key);
  else selections.set(key, selection.map(yScale[key].invert));

  const selected = [];

  // Iterate through the paths and update their appearance based on the selection
  d3.selectAll(".line")
  .each(function(d) {
    // Initialize an 'active' flag to true if the data point is included in the filtered data
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
      .style("stroke", active ? startColor : deselectedColor);

    if (active) {
      d3.select(this).raise();
      selected.push(d);
    }
    d3.selectAll(".brush").raise();
    d3.select("#parallelCoordinates").selectAll(".axisParallel").raise();
  });
    
    currentData = data.filter((d) => {return selected.includes(d)});   

    // Dispatch an event with the selected data
    d3.select("#parallelCoordinates").property("value", selected).dispatch("input");

    // Update other plots
    updateBarChart(currentData);
}

function createYScale(data, dimensions) {
  const yScale = {};

  dimensions.forEach(function (dimension) {
    const min = d3.min(data, (d) => +d[dimension]);
    const max = d3.max(data, (d) => +d[dimension]);

    const scale = d3.scaleLinear()
      .domain([min, max])
      .range([height, 0]);

    yScale[dimension] = scale;
  });

  return yScale;
}

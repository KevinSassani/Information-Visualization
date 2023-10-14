
// Brushing functionality of the parallel coordinates plot
const selections = new Map();
 
function brushed({ selection }, key) {
  const deselectedColor = "rgb(221, 221, 221)";
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



  if (selection === null) selections.delete(key);
  else selections.set(key, selection.map(yScale[key].invert));

  const selected = [];

  // Iterate through the paths and update their appearance based on the selection
  d3.selectAll(".line")
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
    d3.select("#parallelCoordinates").property("value", selected).dispatch("input");
  }
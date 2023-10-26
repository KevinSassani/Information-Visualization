

// Function to handle mouseover event in barchars viz
function handleMouseOveBarChart(event, item) {
  if (currentlyClickedTeam == "non") { // Team is not clicked in bar chart
    // Select all elements with class "data" and filter based on the item's properties
    d3.select("#barCharts")
    .selectAll(".bar")
    .filter(function (d) {
      // Check if "properties" exist in both item and d objects
      return item.name == d.name
    })
    .attr("stroke", "black")
    .attr("stroke-width","2px");
    //.append("title")
    //.text(d => `team : ${codeToName[d.name]}\nwins : ${d.wins}, losses : ${d.losses}\nwins ratio : ${d.winsRatio.toFixed(2)}`); // Change the fill color of the matching elements to red

    showTooltipBar(event, item);
    currentData_barChartHoover = originalData.filter((d) => {return item.name == d.opp});
    data_hoover = aggregateFilteredData();
    updateParallelCoordinatesHooverBarChart(data_hoover);
    updateDensityPlot(data_hoover);
  } else { // A team is clicked in the bar chart
    // Select all elements with class "data" and filter based on the item's properties
    d3.select("#barCharts")
    .selectAll(".bar")
    .filter(function (d) {
      // Check if "properties" exist in both item and d objects
      return item.name == d.name
    })
    //.attr("stroke", "rgb(255,165,0)")
    .attr("stroke", function (d) {
      if (d.name == currentlyClickedTeam) {
        return clickColor;
      } else {
        return hooverColor;
      }
    })
    .attr("stroke-width","2px");

    showTooltipBar(event, item);
    currentData_barChartHoover = originalData.filter((d) => {return item.name == d.opp});
    updateParallelCoordinatesPermanentSelectionClick(aggregateFilteredDataPermanentSelection(true));

  }
  
}


// Function to handle click event in barcharts viz
function handleMouseClickBarChart(event, item) {


  if (currentlyClickedTeam == item.name) {
    // Team already clicked so unselect it
    currentData_barChartClick = originalData;
    updateParallelCoordinates(aggregateFilteredData());
    currentlyClickedTeam = "non"

  } else {

    // Select all elements with class "data" and filter based on the item's properties
    d3.select("#barCharts")
      .selectAll(".bar")
      .filter(function (d) {
        // Check if "properties" exist in both item and d objects
        return item.name == d.name
      })
      .attr("stroke", clickColor)
      .attr("stroke-width","2px");

      currentlyClickedTeam = item.name;
      currentData_barChartClick = originalData.filter((d) => {return item.name == d.opp}); // Maybe should not include this data in the aggreagate function, do concate here instead?
      updateParallelCoordinatesPermanentSelectionClick(aggregateFilteredDataPermanentSelection(false));

  }
}

function handleMouseOutBarChart(event, item){
  

  hideTooltip();

  if (currentlyClickedTeam == "non") {
    d3.select("#barCharts")
    .selectAll(".bar")
    .attr("stroke", "none")

    currentData_barChartHoover = originalData;
    data_hoover_out = aggregateFilteredData();
    updateParallelCoordinates(data_hoover_out);
    updateDensityPlot(data_hoover_out);
  } else {
    d3.select("#barCharts")
    .selectAll(".bar")
    .each(function (d) {
      if (!(d.name == currentlyClickedTeam)) {
        d3.select(this).attr("stroke", "none");
      }
    });

    currentData_barChartHoover = originalData;
    updateParallelCoordinatesPermanentSelectionClick(aggregateFilteredDataPermanentSelection(false));
  }
  
}

function showTooltipBar(event, item) {
  // Get the mouse position
  const [x, y] = [event.pageX, event.pageY];

  let tooltip = d3.select("#tooltip");
  // Set the tooltip text and position
  tooltip
    .text(`Team: ${codeToName[item.name]} || Wins: ${item.wins} || Losses: ${item.losses} || Wins ratio: ${item.winsRatio.toFixed(2)}`) // Format the axis value as needed
    .style("left", x + "px")
    .style("top", (y - 30) + "px")
    .style("font-family", "Nunito, sans-serif"); // Adjust the vertical position of the tooltip

  // Show the tooltip
  tooltip.style("opacity", 1);
}

// Function to hide the tooltip
function hideTooltip() {
  // Hide the tooltip
  d3.select("#tooltip").transition().duration(150).style("opacity", 0);
}


// Brushing functionality of the parallel coordinates plot
const selections = new Map();
 
function brushed({ selection }, key, data) {


  if (selection === null) selections.delete(key);
  else selections.set(key, selection.map(yScale[key].invert));

  const selected = [];

  // Iterate through the paths 
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
        active = false; // Set 'active' to false if one selection does not match
      } 
    
    });


    if (active) {
      selected.push(d);
    }
  });
    
    
    currentData_parallelCoordinates = originalData.filter((d) => {return selected.includes(d)});   

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

function aggregateFilteredData() {
    // Create a Set for each dataset to store unique data points
    const set_parallel = new Set(currentData_parallelCoordinates.map(d => d.id));
    const set_barCharts = new Set(currentData_barCharts.map(d => d.id));
    const set_barChartsHoover = new Set(currentData_barChartHoover.map(d => d.id));
    const set_season = new Set(currentData_seasonSlider.map(d => d.id));
    const set_pointSliderCeltics = new Set(currentData_pointsSlider.map(d => d.id));
    const set_pointSliderOpponent = new Set(currentData_pointsSlider2.map(d => d.id));
  
    // Find the common data points by intersecting the sets
    const commonDataPoints = [...set_parallel].filter(id => set_barCharts.has(id) && set_season.has(id) && set_barChartsHoover.has(id) && set_pointSliderCeltics.has(id) && set_pointSliderOpponent.has(id));
  
    const aggregatedDataset = originalData.filter(d => commonDataPoints.includes(d.id));
  
    return aggregatedDataset;
}

function aggregateFilteredDataPermanentSelection(hooverActive) {

  if (hooverActive) {
    // Create a Set for each dataset to store unique data points
    const set_parallel = new Set(currentData_parallelCoordinates.map(d => d.id));
    const set_barCharts = new Set(currentData_barCharts.map(d => d.id));
    const set_season = new Set(currentData_seasonSlider.map(d => d.id));
    const set_pointSliderCeltics = new Set(currentData_pointsSlider.map(d => d.id));
    const set_pointSliderOpponent = new Set(currentData_pointsSlider2.map(d => d.id));

    const set_barChartsHoover = new Set(currentData_barChartHoover.map(d => d.id));
    const set_barChartsClick = new Set(currentData_barChartClick.map(d => d.id));

    // Apply filtering to the clicked and hoovered data to keep already applied filters from other idoms/filters
    const commonDataPointsHoover = [...set_parallel].filter(id => set_barCharts.has(id) && set_season.has(id) && set_pointSliderCeltics.has(id) && set_pointSliderOpponent.has(id) && set_barChartsHoover.has(id));
    const commonDataPointsClick = [...set_parallel].filter(id => set_barCharts.has(id) && set_season.has(id) && set_pointSliderCeltics.has(id) && set_pointSliderOpponent.has(id) && set_barChartsClick.has(id));
  
    const hooverDataset = originalData.filter(d => commonDataPointsHoover.includes(d.id));
    const clickDataset = originalData.filter(d => commonDataPointsClick.includes(d.id));
  
    return [clickDataset, hooverDataset];
  } else {
    // Create a Set for each dataset to store unique data points
    const set_parallel = new Set(currentData_parallelCoordinates.map(d => d.id));
    const set_barCharts = new Set(currentData_barCharts.map(d => d.id));
    const set_season = new Set(currentData_seasonSlider.map(d => d.id));
    const set_pointSliderCeltics = new Set(currentData_pointsSlider.map(d => d.id));
    const set_pointSliderOpponent = new Set(currentData_pointsSlider2.map(d => d.id));
    // ADD FOR DENSITY PLOT AS WELL

    
    const set_barChartsClick = new Set(currentData_barChartClick.map(d => d.id));

    // Apply filtering to the clicked and hoovered data to keep already applied filters from other idoms/filters
    const commonDataPointsClick = [...set_parallel].filter(id => set_barCharts.has(id) && set_season.has(id) && set_pointSliderCeltics.has(id) && set_pointSliderOpponent.has(id) && set_barChartsClick.has(id));
  
    const clickDataset = originalData.filter(d => commonDataPointsClick.includes(d.id));
  
    return [clickDataset, null];
  }
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

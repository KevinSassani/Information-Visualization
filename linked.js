
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

    console.log(item.name)
    currentData_barChartHoover = originalData.filter((d) => {return item.name == d.opp})
    updateParallelCoordinatesHooverBarChart(currentData_barChartHoover)
}

function handleMouseOutBarChart(event, item){
  d3.select("#barCharts")
    .selectAll(".bar")
    .attr("stroke", "none")

  updateParallelCoordinates(aggregateFilteredData())
}


// Brushing functionality of the parallel coordinates plot
const selections = new Map();
 
function brushed({ selection }, key, data) {
  const deselectedColor = "rgb(221, 221, 221)";
  const startColor = "rgb(0, 104, 71)";
  const brushWidth = 50;


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
        active = false; // Set 'active' to false if one selection does not match
      } 
    
    });


    if (active) {
      selected.push(d);
    }
  });
    
    
    currentData_parallelCoordinates = originalData.filter((d) => {return selected.includes(d)});   

    currentData = aggregateFilteredData();

    // Update plots
    updateBarChart(currentData);
    updateParallelCoordinates(currentData)
}

function aggregateFilteredData() {
    // Create a Set for each dataset to store unique data points
    const set_parallel = new Set(currentData_parallelCoordinates.map(d => d.id));
    const set2_barCharts = new Set(currentData_barCharts.map(d => d.id));
    const set3_season = new Set(currentData_seasonSlider.map(d => d.id));
  
    // Find the common data points by intersecting the sets
    const commonDataPoints = [...set_parallel].filter(id => set2_barCharts.has(id) && set3_season.has(id));
  
    // Filter the datasets to include only common data points
    const aggregatedDataset = currentData_parallelCoordinates
      .filter(d => commonDataPoints.includes(d.id))
      .concat(currentData_barCharts.filter(d => commonDataPoints.includes(d.id)))
      .concat(currentData_seasonSlider.filter(d => commonDataPoints.includes(d.id)));
  
    return aggregatedDataset;
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

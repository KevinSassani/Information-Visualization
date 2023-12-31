function updateBarChart(data) { // HAVE TO UPDATE THE AXES AS WELL
    // Get the container div element
    const containerDiv = document.getElementById("barCharts");

    // Get the width and height of the container using getBoundingClientRect()
    const width = containerDiv.getBoundingClientRect().width;
    const height = containerDiv.getBoundingClientRect().height;

    const padding = 30  
  
    wlTable = winsandlosses(data)
    wTable = wlTable[0]
    lTable = wlTable[1]

    // Calculate the maximum wins and losses for the scales
    const maxWins = d3.max(wTable, d => d.wins);
    const maxLosses = d3.max(lTable, d => d.losses);

    // Wins part
    const svgW = d3.select("#winsBarChart");

    // Create or update scales for the chart
    const yScaleW = d3.scaleBand()
      .domain(wTable.map(d => d.name))
      .range([0.9*height, 0])
      .padding(0.3);

    const xScaleW = d3.scaleLinear()
      .domain([0, maxWins])
      .nice()
      .range([0, 0.75*(width / 2)]);

    const fillScale = d3.scaleLinear()
      .domain([0,1])
      .range([0, 1]);

    // Update the x-axis
    svgW.select(".x-axis")
      .transition()
      .duration(500)
      .call(d3.axisBottom(xScaleW).ticks(5)); // You can adjust the number of ticks as needed

    // Select all existing bars and bind the data to them
    const bars = svgW.selectAll(".bar").data(wTable);


    

    // Update existing bars with transitions for position, width, height, and color
    bars
    .transition()
    .duration(1000)
    .attr("y", d => yScaleW(d.name))
    .attr("width",d => xScaleW(d.wins))
    .attr("height", yScaleW.bandwidth())
    .attr("fill", d => d3.interpolateGreens(fillScale(d.winsRatio)));

    // Remove any bars that are no longer in the updated data 
    // THIS DOES NOT WORK PROPERLY
    bars.exit().transition().duration(500).attr("width", 0).remove();

    // Add new bars for any new data points and transition them to their correct position and width
    bars
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("y", d => yScaleW(d.name))
    .attr("width", 0)
    .attr("height", yScaleW.bandwidth())
    .attr("fill", d => d3.interpolateGreens(fillScale(d.winsRatio)))
    .on("mouseover", handleMouseOveBarChart)
    .on("mousemove", handleMouseOveBarChart)
    .on("mouseout", handleMouseOutBarChart)
    .on("click", handleMouseClickBarChart)
    .transition()
    .duration(1000)
    .attr("width",d => xScaleW(d.wins));

    
    
    // Update the axis with the new data points
    svgW
      .select(".y-axis")
      .transition()
      .duration(500)
      .call(d3.axisLeft(yScaleW).tickSizeOuter(0));
    // Add tooltips to all bars with the movie title as the content
    svgW
      .selectAll(".bar")
      .on("mouseover", handleMouseOveBarChart)
      .on("mousemove", handleMouseOveBarChart)
      .on("mouseout", handleMouseOutBarChart)
      .on("click", handleMouseClickBarChart)
      


    // losses part
    const svgL = d3.select("#lossesBarChart");

    // Create or update scales for the chart
    const yScaleL = d3.scaleBand()
      .domain(lTable.map(d => d.name))
      .range([0.9*height, 0])
      .padding(0.3);

    const xScaleL = d3.scaleLinear()
      .domain([0, maxLosses])
      .nice()
      .range([0, 0.75*(width / 2)]);

    // Update the x-axis
    svgL.select(".x-axis")
      .transition()
      .duration(500)
      .call(d3.axisBottom(xScaleL).ticks(5)); // You can adjust the number of ticks as needed

    // Select all existing bars and bind the data to them
    const barsL = svgL.selectAll(".bar").data(lTable);


    // Remove any bars that are no longer in the updated data
    barsL.exit().transition().duration(500).attr("width", 0).remove();

    // Update existing bars with transitions for position, width, height, and color
    barsL
    .transition()
    .duration(1000)
    .attr("y", d => yScaleL(d.name))
    .attr("width",d => xScaleL(d.losses))
    .attr("height", yScaleL.bandwidth())
    .attr("fill", d => d3.interpolateReds(fillScale(d.lossesRatio)));
    // Add new bars for any new data points and transition them to their correct position and width
    barsL
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("y", d => yScaleL(d.name))
    .attr("width", 0)
    .attr("height", yScaleL.bandwidth())
    .attr("fill", d => d3.interpolateReds(fillScale(d.lossesRatio)))
    .transition()
    .duration(1000)
    .attr("width",d => xScaleL(d.losses));
    
    // Update the axis with the new data points
    svgL
      .select(".y-axis")
      .transition()
      .duration(500)
      .call(d3.axisLeft(yScaleL).tickSizeOuter(0));
    // Add tooltips to all bars 
    svgL
      .selectAll(".bar")
      .on("mouseover", handleMouseOveBarChart)
      .on("mousemove", handleMouseOveBarChart)
      .on("mouseout", handleMouseOutBarChart)
      .on("click", handleMouseClickBarChart)
  }

function updateParallelCoordinates(data) {
    const deselectedColor = "rgb(221, 221, 221)";
    const startColor = "rgb(0, 104, 71)";
    const brushWidth = 50;

    // Get the container div element
    const containerDiv = document.getElementById("parallelCoordinates");

    // Get the width and height of the container using getBoundingClientRect()
    const width = containerDiv.getBoundingClientRect().width;
    const height = containerDiv.getBoundingClientRect().height;


    // Choose dimensions to include in the plot
    dimensions = ["fg_percentage", "free_throw_percentage", "ast", "orb", "drb", "stl", "blk"];

    xScale = d3.scalePoint()
    .range([0, 0.9*width])
    .domain(dimensions);


    // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
    function path(d) {
      return d3.line()(dimensions.map(function(p) { return [xScale(p), yScale[p](d[p])]; }));
    }

    // Update the lines based on the filtered data
    d3.selectAll(".line")
      .data(originalData)
      .join("path")
      //.attr("class", function (d) { return "line season-" + d.season })
      .attr("d", (d) => path(d))
      .style("fill", "none")
      .style("stroke", function (d) {
        const isActive = data.some((dataPoint) => dataPoint.id === d.id);
        if (isActive) {
          // Raise only if isActive is true
          d3.select(this).raise();
          d3.select(this).style("opacity", 0.5);
        }
        return isActive ? startColor : deselectedColor;
      })
      //.style("stroke", function (d) { return (colorScale(d.season)) })
      .style("opacity", 0.5);

      d3.select("#parallelCoordinates").selectAll(".axisParallel").raise();
      d3.selectAll(".brush").raise();
}

function updateParallelCoordinatesHooverBarChart(data) {
  const deselectedColor = "rgb(221, 221, 221)";
  const selectedColor = "rgb(0, 178, 243)";

  // Get the container div element
  const containerDiv = document.getElementById("parallelCoordinates");

  // Get the width and height of the container using getBoundingClientRect()
  const width = containerDiv.getBoundingClientRect().width;
  const height = containerDiv.getBoundingClientRect().height;


  // Choose dimensions to include in the plot
  dimensions = ["fg_percentage", "free_throw_percentage", "ast", "orb", "drb", "stl", "blk"];

  xScale = d3.scalePoint()
  .range([0, 0.9*width])
  .domain(dimensions);


  // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
  function path(d) {
    return d3.line()(dimensions.map(function(p) { return [xScale(p), yScale[p](d[p])]; }));
  }

  // Update the lines based on the filtered data
  d3.selectAll(".line")
    .data(originalData)
    .join("path")
    //.attr("class", function (d) { return "line season-" + d.season })
    .attr("d", (d) => path(d))
    .style("fill", "none")
    .style("stroke", function (d) {
      const isActive = data.some((dataPoint) => dataPoint.id === d.id);
      if (isActive) {
        // Raise only if isActive is true
        d3.select(this).raise();
        d3.select(this).style("opacity", 0.5);
      } else {
        d3.select(this).style("opacity", 0.35);
      }
      return isActive ? selectedColor : deselectedColor;
    });
    //.style("stroke", function (d) { return (colorScale(d.season)) })
    //.style("opacity", 0.5);

    d3.select("#parallelCoordinates").selectAll(".axisParallel").raise();
    d3.selectAll(".brush").raise();

}

function updateParallelCoordinatesPermanentSelectionClick(filterResults) {
  clickData = filterResults[0];
  hooverData = filterResults[1];
  


  // Get the container div element
  const containerDiv = document.getElementById("parallelCoordinates");

  // Get the width and height of the container using getBoundingClientRect()
  const width = containerDiv.getBoundingClientRect().width;


  // Choose dimensions to include in the plot
  dimensions = ["fg_percentage", "free_throw_percentage", "ast", "orb", "drb", "stl", "blk"];

  xScale = d3.scalePoint()
  .range([0, 0.9*width])
  .domain(dimensions);


  // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
  function path(d) {
    return d3.line()(dimensions.map(function(p) { return [xScale(p), yScale[p](d[p])]; }));
  }

  if (!(hooverData == null)) { // Both hoover and click is active so show lines in two different colors
    // Update the lines based on the filtered data
    d3.selectAll(".line")
    .data(originalData)
    .join("path")
    //.attr("class", function (d) { return "line season-" + d.season })
    .attr("d", (d) => path(d))
    .style("fill", "none")
    .style("stroke", function (d) {
      const clickActive = clickData.some((dataPoint) => dataPoint.id === d.id);
      const hooverActive = hooverData.some((dataPoint) => dataPoint.id === d.id);
      if (clickActive) {
        // Raise only if active
        d3.select(this).raise();
        d3.select(this).style("opacity", 0.5);
        return clickColor;
      } else if (hooverActive) {
        // Raise only if active
        d3.select(this).raise();
        d3.select(this).style("opacity", 0.5);
        return hooverColor;
      } else {
        d3.select(this).style("opacity", 0.35);
        return deselectedColor;
      }
    });
    //.style("stroke", function (d) { return (colorScale(d.season)) })
    //.style("opacity", 0.5);

  d3.select("#parallelCoordinates").selectAll(".axisParallel").raise();
  d3.selectAll(".brush").raise();

  } else { // Only click is active so only display that data

  // Update the lines based on the filtered data
  d3.selectAll(".line")
    .data(originalData)
    .join("path")
    //.attr("class", function (d) { return "line season-" + d.season })
    .attr("d", (d) => path(d))
    .style("fill", "none")
    .style("stroke", function (d) {
      const isActive = clickData.some((dataPoint) => dataPoint.id === d.id);
      if (isActive) {
        // Raise only if isActive is true
        d3.select(this).raise();
      }
      return isActive ? clickColor : deselectedColor;
    })
    //.style("stroke", function (d) { return (colorScale(d.season)) })
    .style("opacity", 0.5);

    d3.select("#parallelCoordinates").selectAll(".axisParallel").raise();
    d3.selectAll(".brush").raise();
  }
}

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
    
function updateDensityPlot(currentData){

    minimum = d3.min(currentData, d => Math.min(d.tm, d.opp_score));
    maximum = d3.max(currentData, d => Math.max(d.tm, d.opp_score));
    field = "tm";
    updateCurve(field, currentData, minimum, maximum);
    field = "opp_score"
    updateCurve(field, currentData, minimum, maximum);
}
    
    
    
function updateCurve(fieldValue, data, min, max){
    const containerDiv = document.getElementById("densityPlotFigure");
    const width = containerDiv.getBoundingClientRect().width;
    const height = containerDiv.getBoundingClientRect().height;
    const fieldToFilter = dataField = fieldValue;
    
    // Filter the data based on the selected field
    const filteredData = data.filter(d => d[fieldToFilter] >= min && d[fieldToFilter] <= max); 
    
    
    
    // Calculate the max and min values for the filtered "tm" data
    var xFiltered = d3.scaleLinear()
    .domain([56, 150]) // Fixed x-axis domain
    .nice()
    .range([0, 0.9*width]);
    
    
    
    // Update the x-axis domain
    
    
    var kde = kernelDensityEstimator(kernelEpanechnikov(7), xFiltered.ticks(60));
    var density = kde(filteredData.map(function (d) {
    return d[dataField];
    }));
    
    
    var y = d3.scaleLinear()
    .range([0.8*height, 0])
    .domain([0, 0.07])
    .nice();
    
    
    
    d3.select(".mypath-" + dataField)
    .datum(density)
    .transition()
    .duration(300)
    .attr("d", d3.line()
        .curve(d3.curveBasis)
        .x(function (d) { 
        return xFiltered(d[0]); })
        .y(function (d) { return y(d[1]); })
    );


}
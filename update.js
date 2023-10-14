function updateBarChart(data) { // HAVE TO UPDATE THE AXES AS WELL
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
      .range([height - margin.top - margin.bottom, 0])
      .padding(0.3);

    const xScaleW = d3.scaleLinear()
      .domain([0, maxWins])
      .nice()
      .range([0, width / 2 - margin.left - margin.right - 100]);

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


    // Remove any bars that are no longer in the updated data
    bars.exit().transition().duration(500).attr("width", 0).remove();

    // Update existing bars with transitions for position, width, height, and color
    bars
    .transition()
    .duration(1000)
    .attr("y", d => yScaleW(d.name))
    .attr("width",d => xScaleW(d.wins))
    .attr("height", yScaleW.bandwidth())
    .attr("fill", d => d3.interpolateGreens(fillScale(d.winsRatio)));
    // Add new bars for any new data points and transition them to their correct position and width
    bars
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("y", d => yScaleW(d.name))
    .attr("width", 0)
    .attr("height", yScaleW.bandwidth())
    .attr("fill", d => d3.interpolateGreens(fillScale(d.winsRatio)))
    .transition()
    .duration(2000)
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
      .on("mouseout", handleMouseOutBarChart)
      


    // losses part
    const svgL = d3.select("#lossesBarChart");

    // Create or update scales for the chart
    const yScaleL = d3.scaleBand()
      .domain(lTable.map(d => d.name))
      .range([height - margin.top - margin.bottom, 0])
      .padding(0.3);

    const xScaleL = d3.scaleLinear()
      .domain([0, maxLosses])
      .nice()
      .range([0, width / 2 - margin.left - margin.right - 100]);

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
    .duration(2000)
    .attr("width",d => xScaleL(d.losses));
    
    // Update the axis with the new data points
    svgL
      .select(".y-axis")
      .transition()
      .duration(500)
      .call(d3.axisLeft(yScaleL).tickSizeOuter(0));
    // Add tooltips to all bars with the movie title as the content
    svgL
      .selectAll(".bar")
      .on("mouseover", handleMouseOveBarChart)
      .on("mouseout", handleMouseOutBarChart)
  }

  function updateParallelCoordinates(data) {
    const deselectedColor = "rgb(221, 221, 221)";
    const brushWidth = 50;

    // Choose dimensions to include in the plot
    dimensions = ["fg_percentage", "free_throw_percentage", "ast", "orb", "drb", "stl", "blk"];

    /*
    // Create an object to store your scales
    const yScale = {};

    // For each dimension, build a linear scale
    dimensions.forEach(function(dimension) {
      // Get the min and max values for the dimension
      const min = d3.min(data, d => +d[dimension]);
      const max = d3.max(data, d => +d[dimension]);

      // Create a linear scale for the dimension
      const scale = d3.scaleLinear()
        .domain([min, max])
        .range([height, 0]); 

      // Store the scale in the yScale
      yScale[dimension] = scale;
    });
    */

    xScale = d3.scalePoint()
    .range([0, width])
    .domain(dimensions);

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

    // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
    function path(d) {
      return d3.line()(dimensions.map(function(p) { return [xScale(p), yScale[p](d[p])]; }));
    }

    // Update the lines based on the filtered data
    d3.selectAll(".line")
      .data(data)
      .join("path")
      .attr("class", function (d) { return "line season-" + d.season })
      .attr("d", (d) => path(d))
      .style("fill", "none")
      .style("stroke", function (d) {
        const isActive = d3.select(this).style("stroke") !== deselectedColor;
        return isActive ? colorScale(d.season) : deselectedColor;
      })
      //.style("stroke", function (d) { return (colorScale(d.season)) })
      .style("opacity", 0.5)
      .on("mouseover", function (event, d) {
        const isActive = d3.select(this).style("stroke") !== deselectedColor;
        if (isActive) {
          showTooltip(event, d);
        }
      })
      .on("mouseleave", hideTooltip);
  

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
    d3.selectAll(".axis")
      // For each dimension of the dataset I add a 'g' element:
      .data(dimensions)
      .join()
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
   const brushes = []; // Create an array to store the brush instances

   // Create the brushes for each axis
   dimensions.forEach((key) => {
     const brush = d3.brushY()
       .extent([
         [-(brushWidth / 2), 0],
         [brushWidth / 2, height]
       ])
       .on("start brush end", function (event) {
         brushed(event, key, data);
       });
   
     brushes.push(brush); // Store the brush in the array
   });
   
   // Attach the brushes to the axes
   const axes = d3.select("#parallelCoordinates").selectAll(".axis");
   axes.each(function (d, i) {
     d3.select(this).call(brushes[i]); // Use the appropriate brush from the array
   });
/*
    // Create the brush behavior along the y-axis.
    const brush = d3.brushY()
      .extent([
        [-(brushWidth / 2), 0],
        [brushWidth / 2, height]
      ])
      .on("start brush end", (event) => brushed(event, key, data));
      //.on("start brush end", brushed);

    // Attach the brush to the axes
    const axes = d3.select("#parallelCoordinates").selectAll(".axis");
    axes.call(brush);
    */
}
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

    /*
    //Wins part
    const svgW = d3.select("#winsBarChart");
    // Create scales for the chart
    const yScaleW = d3.scaleBand()
    .domain(wTable.map(d => d.name))
    .range([height - margin.top - margin.bottom, 0])
    .padding(0.3);
    const xScaleW = d3.scaleLinear()
    .domain([0, d3.max(wTable, d => d.wins)])
    .nice()
    .range([0, width / 2 - margin.left - margin.right - 100])
    const fillScale = d3.scaleLinear()
    .domain([0,1])
    .range([0, 1]);
    // Select all existing bars and bind the data to them
    const bars = svgW.selectAll(".bar").data(wTable);
    */


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

    /*
    
    // losses part
    const svgL = d3.select("#lossesBarChart");
    // Create scales for the chart
    const yScaleL = d3.scaleBand()
    .domain(lTable.map(d => d.name))
    .range([height - margin.top - margin.bottom, 0])
    .padding(0.3);
    const xScaleL = d3.scaleLinear()
    .domain([0, d3.max(wTable, d => d.losses)])
    .nice()
    .range([0, width / 2 - margin.left - margin.right - 100])
    // Select all existing bars and bind the data to them
    const barsL = svgL.selectAll(".bar").data(lTable);
    */


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
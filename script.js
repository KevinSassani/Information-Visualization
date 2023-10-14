// Global data variable
// Define a global variable to store the loaded CSV data
var csvData;

// Define margin and dimensions for the charts
const margin = {
  top: 20,
  right: 40,
  bottom: 50,
  left: 40,
};

const padding = 20

const width = (window.screen.width - margin.left - margin.right) / 2;
const height = (window.screen.height - margin.top - margin.bottom) / 2;


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

    
    // Convert incomeperperson and alcconsumption data to numbers
    csvData.forEach(function (d) {
      d.season = +d.season
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
    


    // Call functions to create the plots
    // createParallelCoordinates(); //Define width inside this function
    // createDensityPlot(); //Define width inside this function
    createDensityPlot();
    
  })

  };


  function createDensityPlot() {
    var margin = { top: 30, right: 30, bottom: 30, left: 50 },
      width = 460 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;
  
    var svg = d3.select("#densityPlot")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
    var sliderContainer = d3.select("#densityPlot")
      .append("div")
      .attr("id", "slider-container");
      
  
    var sliderSvg = sliderContainer.append("svg")
      .attr("id", "slider")
      .attr("width", 320)
      .attr("height", 50);;
  
    const sliderRange = d3
      .sliderBottom()
      .min(d3.min(csvData, d => Math.min(d.tm, d.opp_score)))
      .max(d3.max(csvData, d => Math.max(d.tm, d.opp_score)))
      .width(300)
      .default([d3.min(csvData, d => Math.min(d.tm, d.opp_score)), d3.max(csvData, d => Math.max(d.tm, d.opp_score))])
      .fill('#85bb65')
      .ticks(0);
  
    sliderRange.on('onchange', val => {
      x.domain(val);
      redrawDensityPlot('tm'); // Update the 'tm' density plot
      //redrawDensityPlot('opp_score'); // Update the 'opp_score' density plot
      svg.select(".x-axis")
        .transition()
        .duration(300)
        .call(d3.axisBottom(x));
    });
  
    sliderSvg.call(sliderRange);



    var sliderContainer = d3.select("#densityPlot")
      .append("div")
      .attr("id", "slider-container");
    
  
    var sliderSvg2 = sliderContainer.append("svg")
      .attr("id", "slider")
      .attr("width", 320)
      .attr("height", 50);
  
    const sliderRange2 = d3
      .sliderBottom()
      .min(d3.min(csvData, d => Math.min(d.tm, d.opp_score)))
      .max(d3.max(csvData, d => Math.max(d.tm, d.opp_score)))
      .width(300)
      .default([d3.min(csvData, d => Math.min(d.tm, d.opp_score)), d3.max(csvData, d => Math.max(d.tm, d.opp_score))])
      .fill('#404080');
  
    sliderRange2.on('onchange', val => {
      x.domain(val);
      //redrawDensityPlot('tm'); // Update the 'tm' density plot
      redrawDensityPlot('opp_score'); // Update the 'opp_score' density plot
      svg.select(".x-axis")
        .transition()
        .duration(300)
        .call(d3.axisBottom(x));
    });
  
    sliderSvg2.call(sliderRange2);
  
    var x = d3.scaleLinear()
      .domain([
        d3.min(csvData, function (d) { return Math.min(d.tm, d.opp_score); }),
        d3.max(csvData, function (d) { return Math.max(d.tm, d.opp_score); })
      ])
      .nice()
      .range([0, width]);
  
    svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));
  



    var y = d3.scaleLinear()
      .range([height, 0])
      .domain([0, 0.06]);
      
    svg.append("g")
      .attr("class", "y-axis")
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
  
    function redrawDensityPlot(dataField) {
      var minslidervalue = 0;
      var maxslidervalue = 0;
      const currentSliderRange = sliderRange.value();
      const currentSliderRange2 = sliderRange2.value();

      // Get the minimum and maximum values from the current slider range
      const minSliderValue = currentSliderRange[0];
      const maxSliderValue = currentSliderRange[1];

      const minSliderValue2 = currentSliderRange2[0];
      const maxSliderValue2 = currentSliderRange2[1];

      if (minSliderValue<minSliderValue2){
        minslidervalue = minSliderValue;
      }
      else{
        minslidervalue = minSliderValue2;
      }

      if(maxSliderValue > maxSliderValue2){
        maxslidervalue = maxSliderValue;
      }

      else{
        maxslidervalue = maxSliderValue2;
      }
        



      const filteredTMData = csvData.filter(d => d.tm >= minSliderValue && d.tm <= maxSliderValue);

      // Calculate the max and min values for the filtered "tm" data
      const maxDomainValue = d3.max(filteredTMData, d => d[dataField]);
      const minDomainValue = d3.min(filteredTMData, d => d[dataField]);

      // Update the x-axis domain with the fixed range from 6 to 150
      

      console.log(minSliderValue)
      // Update the x-axis domain
      
      var kde = kernelDensityEstimator(kernelEpanechnikov(7), x.ticks(60));
      var density = kde(csvData.map(function (d) {
        return d[dataField]; // 'tm' or 'opp_score'
      }));

      
  
      svg.select(".mypath-" + dataField)
        .datum(density)
        .transition()
        .duration(300)
        .attr("d", d3.line()
          .curve(d3.curveBasis)
          .x(function (d) { return x(d[0]); })
          .y(function (d) { return y(d[1]); })
        );
      
    }
  
    // Create the initial density plots for both 'tm' and 'opp_score'
    createInitialDensityPlot('tm');
    createInitialDensityPlot('opp_score');
  
    function createInitialDensityPlot(dataField) {
      var kde = kernelDensityEstimator(kernelEpanechnikov(7), x.ticks(60));
      var density = kde(csvData.map(function (d) {
        return d[dataField]; // 'tm' or 'opp_score'
      }));
  
      svg.append("path")
        .attr("class", "mypath-" + dataField)
        .datum(density)
        .attr("fill", dataField === 'tm' ? "#69b3a2" : "#404080")
        .attr("opacity", ".6")
        .attr("stroke", "#000")
        .attr("stroke-width", 1)
        .attr("stroke-linejoin", "round")
        .attr("d", d3.line()
          .curve(d3.curveBasis)
          .x(function (d) { return x(d[0]); })
          .y(function (d) { return y(d[1]); })
        );
  
      // Add legend
      svg.append("circle").attr("cx", 300).attr("cy", 30).attr("r", 6).style("fill", dataField === 'tm' ? "#69b3a2" : "#404080");
      svg.append("text").attr("x", 320).attr("y", 30).text(dataField).style("font-size", "15px").attr("alignment-baseline", "middle");

  

    }
  }
  
  
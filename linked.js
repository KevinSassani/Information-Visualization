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
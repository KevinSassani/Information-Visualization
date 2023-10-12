// Function to handle mouseover event
function handleMouseOver(event, item) {
  // Select all elements with class "data" and filter based on the item's properties
  d3.selectAll(".data")
    .filter(function (d) {
      // Check if "properties" exist in both item and d objects
      if ("properties" in item) {
        if ("properties" in d) return item.properties.name == d.properties.name;
        else return item.properties.name == d.country;
      } else if ("properties" in d) {
        return item.country == d.properties.name;
      } else if ("x" in item) {
        console.log(item.data.country)
        console.log(d.country)
        return item.data.country == d.country;
      } else {
        return item.country == d.country;
      }
    })
    .attr("fill", "red"); // Change the fill color of the matching elements to red
}

// Function to handle mouseout event
function handleMouseOut(event, item) {
  // Filter the current data to remove entries with missing incomeperperson values
  currentData = globalDataCapita.filter(function (d) {
    return d.incomeperperson != "" && d.alcconsumption != "" && d.lifeexpectancy != "";
  });

  // Create a color scale for the incomeperperson values
  const colorScale = d3
    .scaleLog()
    .domain([
      d3.min(currentData, (d) => d.incomeperperson),
      d3.max(currentData, (d) => d.incomeperperson),
    ])
    .range([0, 1]);

  // Reset the fill color of all elements with class "country data" to black
  d3.selectAll(".country.data").attr("fill", "black");

  // Set the fill color of each country based on its incomeperperson value
  currentData.forEach((element) => {
    d3.selectAll(".country.data")
      .filter(function (d) {
        return d.properties.name == element.country;
      })
      .attr("fill", d3.interpolateBlues(colorScale(element.incomeperperson)));
  });

  // Reset the fill color of all elements with class "circle data" to steelblue
  d3.selectAll("circle.data").attr("fill", "steelblue");

  // Create a fill scale for the lifeexpectancy values
  const fillScale = d3
    .scaleLinear()
    .domain([
      d3.min(currentData, (d) => d.lifeexpectancy),
      d3.max(currentData, (d) => d.lifeexpectancy),
    ])
    .range([0, 1]);

  // Set the fill color of each country based on its lifeexpectancy value
  d3.selectAll(".bee.data").attr("fill", d => d3.interpolateBlues(fillScale(d.data.lifeexpectancy)))
}

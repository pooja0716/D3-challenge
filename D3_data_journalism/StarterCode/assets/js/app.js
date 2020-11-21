// @TODO: YOUR CODE HERE!
// Build a chart

var svgWidth = 960;
var svgHeight = 620;

var margin = {
  top: 20,
  right: 10,
  bottom: 100,
  left: 90
}

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

//Create an SVG wrapper, append an SVG group which will hold our chart   

var svg = d3.select("#scatter")
   .append("svg")
   .attr("width", svgWidth)
   .attr("height", svgHeight);

// Chart group

var chartGroup = svg.append("g")
   .attr("transform", `translate(${margin.left}, ${margin.top})`).classed("chart", true);

//Import our data

d3.csv("assets/data/data.csv").then(function(StatesData) {

  //Parse data
  StatesData.forEach(function(data) {
       data.age = +data.age
       data.healthcare = +data.healthcare
       data.obesity = +data.obesity
       data.poverty = +data.poverty
       data.smokes = +data.smokes
       data.income = +data.income
  });

  // Create X and Y scale functions

  var xLinearScale = d3.scaleLinear()
      .domain([d3.min(StatesData, d => d.poverty) * 0.90, d3.max(StatesData, d => d.poverty) * 1.10])
      .range([0, width])
      .nice();

  var yLinearScale = d3.scaleLinear()
      .domain([d3.min(StatesData, d => d.healthcare) * 0.90, d3.max(StatesData, d => d.healthcare) * 1.10])
      .range([height, 0])
      .nice();
      
  //Create an Axis functions

  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // Append Axes

  chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis)

  chartGroup.append("g")
      .call(leftAxis)

  // Create Circles

  var circlesGroup = chartGroup.selectAll("circle")
      .data(StatesData)
      .enter()
      .append("circle")
      .classed("stateCircle", true)
      .attr("cx", d => xLinearScale(d.poverty))
      .attr("cy", d => yLinearScale(d.healthcare))
      .attr("r", "15")

  //Add state to circles

  chartGroup.append("g")
      .selectAll("text")
      .data(StatesData)
      .enter()
      .append("text")
      .classed("stateText", true)
      .text(d => d.abbr)
      .attr("x", d => xLinearScale(d.poverty))
      .attr("y", d => yLinearScale(d.healthcare))
      .attr("alignment-baseline", "central")


  // Initialize tooltip

  var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.state}<br>In Poverty: ${d.poverty}%<br>Lacks Healthcare: ${d.healthcare}%`)

      })

  // Create tooltip in the chart
  chartGroup.call(toolTip);

  // Create Event Listeners to display

  circlesGroup.on("mouseover", function(circle) {
    toolTip.show(circle, this)
  })
 
  // On mouseout event

  .on("mouseout", function(circle, index) {
     toolTip.hide(circle, this);
  })

  // Create Axis labels

  chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 40)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("class", "aText")
      .text("Lacks Healthcare (%)")

  chartGroup.append("text")
       .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
       .attr("class", "aText")
       .text("In Poverty (%)")


})




    
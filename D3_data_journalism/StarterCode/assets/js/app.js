// @TODO: YOUR CODE HERE!
// Build a chart
var svgWidth = 960
var svgHeight = 500

var margin = {
  top: 20,
  right: 40,
  bottom: 60,
  left: 100
}

var width = svgWidth - margin.left - margin.right
var height = svgHeight - margin.top - margin.bottom

// Create an SVG wrapper, append an SVG group which will hold our chart
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight)

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`).classed("chart", true)

// Import our data
d3.csv("assets/data/data.csv").then(function(data) {
    // Parse data
    data.forEach(function(item) {
        item.age = +item.age
        item.healthcare = +item.healthcare
        item.obesity = +item.obesity
        item.poverty = +item.poverty
        item.smokes = +item.smokes
        item.income = +item.income
    })

    // Create x and y scale functions
    var xScale = d3.scaleLinear()
        .domain([8, d3.max(data, d => d.poverty)])
        .range([0, width])
        .nice() 
    
    var yScale = d3.scaleLinear()
        .domain([4, d3.max(data, d => d.healthcare)])
        .range([height, 0])
        .nice()
    
    // Create an  Axis functions
    var bottomAxis = d3.axisBottom(xScale)
    var leftAxis = d3.axisLeft(yScale)

    // Append Axes 
    chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis)

    chartGroup.append("g")
      .call(leftAxis)

    // Create circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .classed("stateCircle", true)
        .attr("cx", d => xScale(d.poverty))
        .attr("cy", d => yScale(d.healthcare))
        .attr("r", "15")
    
    // Add state  to circles
    chartGroup.append("g")
        .selectAll('text')
        .data(data)
        .enter()
        .append("text")
        .classed("stateText", true)
        .text(d=>d.abbr)
        .attr("x", d=>xScale(d.poverty))
        .attr("y", d=>yScale(d.healthcare))
        .attr("alignment-baseline", "central")

    // Initialize Tool-tip
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.state}<br>In Poverty: ${d.poverty}%<br>Lacks Healthcare: ${d.healthcare}%`)
      })

    // Create Tool-tip in the chart
    chartGroup.call(toolTip)

    // Create Event Listeners to display 
    circlesGroup.on("mouseover", function(circle) {
        toolTip.show(circle, this)
      })
        // On mouseout event
        .on("mouseout", function(circle, index) {
          toolTip.hide(circle, this);
        })

    // Create Axes labels
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
// Build chart
var svgWidth = 960
var svgHeight = 500

var margin = {
  top: 20,
  right: 40,
  bottom: 85,
  left: 100
}

var width = svgWidth - margin.left - margin.right
var height = svgHeight - margin.top - margin.bottom

// Create an SVG wrapper, append SVG group which will hold our chart, and shift that by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .classed("chart", true)
  .attr("width", svgWidth)
  .attr("height", svgHeight)

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`)


var currentX = "age"
var currentY = "smokes"

// Now Create X and Y scale function
function xScale(data, currentX) {
  var xLinearScale = d3.scaleLinear()
    .domain([
      d3.min(data, d => d[currentX] * 0.95),
      d3.max(data, d => d[currentX])])
    .range([0, width])
    .nice()

  return xLinearScale  
}

function yScale(data, currentY) {
  var yLinearScale = d3.scaleLinear()
    .domain([
      d3.min(data, d => d[currentY] * 0.85),
      d3.max(data, d => d[currentY])])
    .range([height, 0])
    .nice()

  return yLinearScale
}

// Import our data
function getData() {
  d3.csv("assets/data/data.csv").then(function(data) {
    // Parse Data
    data.forEach(function(item) {
        item.age = +item.age
        item.healthcare = +item.healthcare
        item.income = +item.income
        item.obesity = +item.obesity
        item.poverty = +item.poverty
        item.smokes = +item.smokes
    })
    
    // Get x and y scales 
    var xLinearScale = xScale(data, currentX)
    var yLinearScale = yScale(data, currentY)

    // Create Axis functions
    var bottomAxis = d3.axisBottom(xLinearScale)
    var leftAxis = d3.axisLeft(yLinearScale)

    // Append Axes 
    var xAxis = chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis)

    var yAxis = chartGroup.append("g")
      .call(leftAxis)

    // create a base layer 
    var controlGroup = chartGroup.selectAll("circle")
      .data(data)
      .enter()
      .append("g")

    // Create Circles
    var circlesGroup = controlGroup.append("circle")
        .classed("stateCircle", true)
        .attr("cx", d => xLinearScale(d[currentX]))
        .attr("cy", d => yLinearScale(d[currentY]))
        .attr("r", "15")
    
    // Add state to circles
    var textGroup = controlGroup.append("text")
        .classed("stateText", true)
        .text(d => d.abbr)
        .attr("x", d => xLinearScale(d[currentX]))
        .attr("y", d => yLinearScale(d[currentY]))
        .attr("alignment-baseline", "central")

    // Create Axes labels
    var xAxisLabel = chartGroup.append("g")
      .attr("transform", `translate(${width/2}, ${height + 20 + margin.top})`)
      .attr("class", "aText")

    var yAxisLabel = chartGroup.append("g")
      .attr('transform', `translate(${0 - margin.left / 4}, ${height / 2})`)
      .attr("class", "aText")

    var ageLabel = xAxisLabel.append("text")
      .attr("x", 0)
      .attr("y", 0)
      .attr("value", "age")
      .classed("active", true)
      .classed("aText", true)
      .text("Age (Median)")
    
    var povertyLabel = xAxisLabel.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty")
      .classed("inactive", true)
      .classed("aText", true)
      .text("In Poverty (%)")

    var incomeLabel = xAxisLabel.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "income")
      .classed("inactive", true)
      .classed("aText", true)
      .text("Household Income (Median)")

    var smokesLabel = yAxisLabel.append("text")
      .attr('y', 0 - 20)
      .attr('x', 0)
      .attr('transform', 'rotate(-90)')
      .attr('dy', '1em')
      .attr("value", "smokes")
      .classed("active", true)
      .classed("aText", true)
      .text("Smokes (%)")

    var healthcareLabel = yAxisLabel.append("text")
      .attr('y', 0 - 40)
      .attr('x', 0)
      .attr('transform', 'rotate(-90)')
      .attr('dy', '1em')
      .attr("value", "healthcare")
      .classed("inactive", true)
      .classed("aText", true)
      .text("Lacks Healthcare (%)")

    var obesityLabel = yAxisLabel.append("text")
      .attr('y', 0 - 60)
      .attr('x', 0)
      .attr('transform', 'rotate(-90)')
      .attr('dy', '1em')
      .attr("value", "obesity")
      .classed("inactive", true)
      .classed("aText", true)
      .text("Obese (%)")
    
    // Tool-tip for Base chart
    circlesGroup = updateToolTip(currentX, currentY, circlesGroup)
    
    // event listener for x Axis
    xAxisLabel.selectAll("text")
      .on("click", function() {
        // Get value
        var value = d3.select(this).attr("value")
        if (value !== currentX) {
          // Replace currentX with value
          currentX = value

          // Update x scale
          xLinearScale = xScale(data, currentX)

          // Updates Axis using Transition
          xAxis = transitionXAxis(xLinearScale, xAxis)

          // Updates circles
          circlesGroup = updateCircles(circlesGroup,
                                       xLinearScale,
                                       yLinearScale,
                                       currentX,
                                       currentY)

          // Updates Text
          textGroup = updateText(textGroup,
                                 xLinearScale,
                                 yLinearScale,
                                 currentX,
                                 currentY)
            
          // Changes class to inactive
          if (currentX === 'poverty') {
            povertyLabel.classed('active', true).classed('inactive', false)
            ageLabel.classed('active', false).classed('inactive', true)
            incomeLabel.classed('active', false).classed('inactive', true)
          } else if (currentX === 'age') {
            povertyLabel.classed('active', false).classed('inactive', true)
            ageLabel.classed('active', true).classed('inactive', false)
            incomeLabel.classed('active', false).classed('inactive', true)
          } else {
            povertyLabel.classed('active', false).classed('inactive', true)
            ageLabel.classed('active', false).classed('inactive', true)
            incomeLabel.classed('active', true).classed('inactive', false)
          }

          // update tooltip
          circlesGroup = updateToolTip(currentX, currentY, circlesGroup)
        }
      })

      // Event listener for Y Axis
      yAxisLabel.selectAll("text")
        .on("click", function(){
          // Get value
          var value = d3.select(this).attr("value")
          if (value !== currentY) {
            currentY = value

            // Update y scale
            yLinearScale = yScale(data, currentY)

            // Updates Axis Transition
            yAxis = transitionYAxis(yLinearScale, yAxis)

            // Updates circles
            circlesGroup = updateCircles(circlesGroup,
                                         xLinearScale,
                                         yLinearScale,
                                         currentX,
                                         currentY)

            // Update Text
            textGroup = updateText(textGroup,
                                   xLinearScale,
                                   yLinearScale,
                                   currentX,
                                   currentY)

            // Changes class to inactive
            if (currentY === 'healthcare') {
              healthcareLabel.classed('active', true).classed('inactive', false)
              smokesLabel.classed('active', false).classed('inactive', true)
              obesityLabel.classed('active', false).classed('inactive', true)
            } else if (currentY === 'smokes') {
              healthcareLabel.classed('active', false).classed('inactive', true)
              smokesLabel.classed('active', true).classed('inactive', false)
              obesityLabel.classed('active', false).classed('inactive', true)
            } else {
              healthcareLabel.classed('active', false).classed('inactive', true)
              smokesLabel.classed('active', false).classed('inactive', true)
              obesityLabel.classed('active', true).classed('inactive', false)
            }

            // Update Tool-tip
            circlesGroup = updateToolTip(currentX, currentY, circlesGroup)
          }
        })
})}

// Transition Axes 
function transitionXAxis(xLinearScale, xAxis) {
  var bottomAxis = d3.axisBottom(xLinearScale)

  xAxis.transition().duration(100).call(bottomAxis)

  return xAxis
}

function transitionYAxis(yLinearScale, yAxis) {
  var leftAxis = d3.axisLeft(yLinearScale)

  yAxis.transition().duration(100).call(leftAxis)

  return yAxis
}

// Update Circles 
function updateCircles(circlesGroup, xLinearScale, yLinearScale, currentX, currentY) {
  circlesGroup.transition().duration(100)
    .attr("cx", d => xLinearScale(d[currentX]))
    .attr("cy", d => yLinearScale(d[currentY]))
    .attr("r", "15")
  
  return circlesGroup
}

// Update Text
function updateText(textGroup, xLinearScale, yLinearScale, currentX, currentY) {
  textGroup.transition().duration(100)
    .attr("x", d => xLinearScale(d[currentX]))
    .attr("y", d => yLinearScale(d[currentY]))
    .attr("alignment-baseline", "central")

  return textGroup
}

function updateToolTip(currentX, currentY, circlesGroup){
  var xLabel = ""
  var yLabel = ""

  if (currentX === "poverty") {
    xLabel = "Poverty: "
  } else if (currentX === 'age') {
    xLabel = 'Age: '
  } else {
    xLabel = 'Income: $'
  }
  if (currentY === 'healthcare') {
    yLabel = 'Lack Care: '
  } else if (currentY === 'smokes') {
    yLabel = 'Smokes: '
  } else {
    yLabel = 'Obesity: '
  }

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      if (currentY === 'smokes' || currentY === 'obesity') {
        if (currentX === 'poverty') {
          return `${d.state}<br>${xLabel}${d[currentX]}%<br>${yLabel}${d[currentY]}%`
        }
        return `${d.state}<br>${xLabel}${d[currentX]}<br>${yLabel}${d[currentY]}%`
      } else if (currentX === 'poverty') {
        return `${d.state}<br>${xLabel}${d[currentX]}%<br>${yLabel}${d[currentY]}%`
      } else {
        return `${d.state}<br>${xLabel}${d[currentX]}<br>${yLabel}${d[currentY]}%`
      }
    })

    chartGroup.call(toolTip)

    circlesGroup.on("mouseover", function(circle) {
      toolTip.show(circle, this)
    }).on("mouseout", function(circle, index) {
      toolTip.hide(circle, this)
    })

    return circlesGroup
}

getData()
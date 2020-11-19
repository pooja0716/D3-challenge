// Build a chart
var svgWidth = 980;
var svgHeight = 620;

var margin = {
  top: 20,
  right: 10,
  bottom: 100,
  left: 100
}

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append SVG group which will hold our chart
var svg = d3.select("#scatter")
  .append("svg")
  .classed("chart", true)
  .attr("width", svgWidth)
  .attr("height", svgHeight);

  // Chart group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);


var chosenX = "poverty";
var chosenY = "healthcare";

var Transition = "No";

// create X-Axis label
var xLabels = chartGroup.append("g")
   .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
   .attr("class", "aText");

var PovertyLabel = xLabels.append("text")
   .classed("active", true)
   .attr("x", 0)
   .attr("y", 0)
   .attr("value", "poverty")
   .text("In Poverty (%)");

var AgeLabel = xLabels.append("text")
   .classed("inactive", true)
   .attr("x", 0)
   .attr("y", 20)
   .attr("value", "age")
   .text("Age (Median)");

var IncomeLabel = xLabels.append("text")
   .classed("inactive", true)
   .attr("x", 0)
   .attr("y", 40)
   .attr("value", "income")
   .text("Household Income (Median)");


// Create Y-Axis labels

var yLabels = chartGroup.append("g")
   .attr("transform", `translate(${0 - margin.left + 40}, ${(height/2)})`)
   .attr("class", "aText");

var HealthcareLabel = yLabels.append("text")
   .attr("transform", "rotate(-90)")
   .attr("y", 0)
   .attr("x", 0)
   .attr("dy", "1em")
   .classed("active", true)
   .attr("value", "healthcare")
   .text("Lacks Healthcare (%)");

var SmokesLabel = yLabels.append("text")
   .attr("transform", "rotate(-90)")
   .attr("y", -20)
   .attr("x", 0)
   .attr("dy", "1em")
   .classed("inactive", true)
   .attr("value", "smokes")
   .text("Smokes (%)");

var ObeseLabel = yLabels.append("text")
   .attr("transform", "rotate(-90)")
   .attr("y", -40)
   .attr("x", 0)
   .attr("dy", "1em")
   .classed("inactive", true)
   .attr("value", "obesity")
   .text("Obesity (%)");

// Call Scatterbuild function
scatterbuild(chosenX, chosenY);

// define scatterbuild function
function scatterbuild(chosenX, chosenY) {

  // Import our data
  d3.csv("assets/data/data.csv").then(function(StatesData){

    //Parse Data to number

    StatesData.forEach(function(data) {
       data.poverty = +data.poverty;
       data.healthcare = +data.healthcare;
       data.age = +data.age;
       data.obesity = +data.obesity;
       data.income = +data.income;
       data.smokes = +data.smokes;
    });

    // Create x and y scale functions

    var xLinearScale = d3.scaleLinear()
       .domain([d3.min(StatesData, d => d[chosenX]) * 0.75, d3.max(StatesData, d => d[chosenX]) * 1.1])
       .range([0, width]);

    var yLinearScale = d3.scaleLinear()
       .domain([d3.min(StatesData, d => d[chosenY]) * 0.75, d3.max(StatesData, d => d[chosenY]) * 1.1])
       .range([height, 0]);

       // Create Axis functions

    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);


    // Append axis to the chart

    var xaxis = chartGroup.selectAll(".xaxis")
       .data(StatesData);

    xaxis.enter()
       .append("g")
       .classed("xaxis", true)
       .merge(xaxis)
       .attr("transform", `translate(0, ${height})`)
       .transition().duration(500).call(bottomAxis);

    xaxis.exit().remove()

    var yaxis = chartGroup.selectAll(".yaxis")
      .data(StatesData);

    yaxis.enter()
       .append("g")
       .classed("yaxis", true)
       .merge(yaxis)
       .transition().duration(500).call(leftAxis);

    yaxis.exit().remove()

    // Create Circles

    if(Transition === "No") {
       var circlesGroup = chartGroup.selectAll("circle")
          .data(StatesData);

       circlesGroup.enter()
          .append("circle")
          .classed("stateCircle", true)
          .merge(circlesGroup)
          .attr("cx", d => xLinearScale(d[chosenX]))
          .attr("cy", d => yLinearScale(d[chosenY]))
          .attr("r", "12")
          .attr("opacity", "0.75");

       circlesGroup.exit().remove();
    }else {
       var circlesGroup = chartGroup.selectAll("circle")
          .data(StatesData);

          circlesGroup.enter()
             .append("circle")
             .classed("stateCircle", true)
             .merge(circlesGroup)
             .transition()
             .duration(1000)
             .attr("cx", d => xLinearScale(d[chosenX]))
             .attr("cy", d => yLinearScale(d[chosenY]))
             .attr("r", "12")
             .attr("opacity", "0.75");

          circlesGroup.exit().remove();
    }

    // Append text to circles

    if(Transition === "No") {

      var Appendtext = chartGroup.selectAll(".stateText")
         .data(StatesData);

      Appendtext.enter()
         .append("text")
         .classed("stateText", true)
         .merge(Appendtext)
         .attr("x", d => xLinearScale(d[chosenX]))
         .attr("y", d => yLinearScale(d[chosenY]))
         .text(d => d.abbr)
         .style("font-size", "11px");

      Appendtext.exit().remove();
  
    }else {
      var Appendtext = chartGroup.selectAll(".stateText")
         .data(StatesData);

        Appendtext.enter()
          .append("text")
          .classed("stateText", true)
          .merge(Appendtext)
          .transition()
          .duration(1000)
          .attr("x", d => xLinearScale(d[chosenX]))
          .attr("y", d => yLinearScale(d[chosenY]))
          .text(d => d.abbr)
          .style("font-size", "10px");

        Appendtext.exit().remove();
    }


    // Initialize Tool-tip

    var toolTip = d3.tip()
       .attr("class", "d3-tip")
       .offset([-20, 40])
       .html(function(d) {
          return(`${d["state"]}<br>${chosenX}: ${d[chosenX]}<br>${chosenY}: ${d[chosenY]}`);

       });

    // Create Tooltip in the chart

    chartGroup.call(toolTip);

    // Create Event listeners to display and hide the tooltip

    chartGroup.selectAll(".stateText")
       .on("mouseover", function(data) {
           toolTip.show(data, this);

       })

       // onmouseout event

       .on("mouseout", function(data) {
         toolTip.hide(data);
       })

       xLabels.selectAll("text")
          .on("click", function() {
              var xlabelvalue = d3.select(this).attr("value");

              // Change the variable transition after the first xlabel onclick action
              Transition = "Yes"

              //Assign new parameter 
              chosenX = xlabelvalue;

              //call scatterbuild functions using chosenX parameter
              scatterbuild(chosenX, chosenY)

              // change classes

              if (chosenX === "poverty") {
                 PovertyLabel.classed("active", true).classed("inactive", false);
                 AgeLabel.classed("active", false).classed("inactive", true);
                 IncomeLabel.classed("active", false).classed("inactive", true);

              } else if (chosenX === "age") {
                 PovertyLabel.classed("active", false).classed("inactive", true);
                 AgeLabel.classed("active", true).classed("inactive", false);
                 IncomeLabel.classed("active", false).classed("inactive", true);

              } else {
                 PovertyLabel.classed("active", false).classed("inactive", true);
                 AgeLabel.classed("active", false).classed("inactive", true);
                 IncomeLabel.classed("active", true).classed("inactive", false);
                
              }

            });

            yLabels.selectAll("text")
              .on("click", function() {
                 var ylabelvalue = d3.select(this).attr("value");

                 // change the variable transition after the first ylabel on click action
                 Transition = "Yes"

                 // Assign new parameter
                 chosenY = ylabelvalue;

                 // call scatterbuild functions using chosenY parameter
                 scatterbuild(chosenX, chosenY)

                 if (chosenY === "healthcare") {
                     HealthcareLabel.classed("active", true).classed("inactive", false);
                     SmokesLabel.classed("active", false).classed("inactive", true);
                     ObeseLabel.classed("active", false).classed("inactive", true);

                 }else if (chosenY === "smokes") {
                    HealthcareLabel.classed("active", false).classed("inactive", true);
                    SmokesLabel.classed("active", true).classed("inactive", false);
                    ObeseLabel.classed("active", false).classed("inactive", true);

                 }else {
                    HealthcareLabel.classed("active", false).classed("inactive", true);
                    SmokesLabel.classed("actie", false).classed("inactive", true);
                    ObeseLabel.classed("active", true).classed("inactive", false);

                 }
              });
    
          }).catch(function(error) {
            console.log(error);
          })

    };
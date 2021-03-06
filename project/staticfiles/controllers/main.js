angular.module('gitCloneApp')
.controller('mainCtrl', function($scope, $http){
    let scope = $scope;

    scope.countTotal = 0;

    scope.init = function() {
        scope.getGraph().then(res => {

            scope.countTotal = scope.getCountTotal(res.data);
            let data = scope.convertDateToObject(res.data);
            scope.generateLineGraph(data);
        }, err => {
            console.error(err);
        });
    }

    scope.getGraph = function() {
        return $http({
            url: '/api/v1/get-count/',
            method: 'GET'
        })
    }

    scope.addCount = function() {
        $http({
            url: '/api/v1/add-count/',
            method: 'POST'
        }).then(_ => {
            scope.getGraph().then(res => {
                scope.countTotal = scope.getCountTotal(res.data);
                let data = scope.convertDateToObject(res.data);
                scope.updateLineGraph(data);
            });
        }, err => {
            console.error(err);
        });
    }

    scope.getCountTotal = function(data) {
        let output = 0;

        for (item of data) {
            output += parseInt(item.count);
        }

        return output;
    }

    scope.convertDateToObject = function (data) {
        let output = [];
        for (item of data) {
            // convert to javascript timestamp
            let dateRgx = item.date.match(/^(\d{4})\-(\d{1,2})\-(\d{1,2})/);

            let year = parseInt(dateRgx[1]);
            let month = parseInt(dateRgx[2]) - 1;
            let days = parseInt(dateRgx[3]);

            item.date = new Date(year, month, days);

            output.push(item);
        }

        return output;
    }


    scope.updateLineGraph = function(lineData) {
        var height  = 200;
        var width   = 700;
        var hEach   = 40;

        var margin = {top: 20, right: 15, bottom: 25, left: 25};

        width =     width - margin.left - margin.right;
        height =    height - margin.top - margin.bottom;

        lineData = lineData.sort(function(a,b){
            return new Date(b.date) - new Date(a.date);
        });

        var valueline = d3.line()
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d.count);  })
            .curve(d3.curveMonotoneX);

        var x = d3.scaleTime().range([0, width]);
        var y = d3.scaleLinear().range([height, 0]);

        x.domain(d3.extent(lineData, function(d) { return d.date; }));
        y.domain([d3.min(lineData, function(d) { return d.count; }) - 5, 100]);

        var svg = d3.select('#data')

        var u = svg.selectAll(".dot")
            .data(lineData);
        var t = svg.selectAll(".label")
            .data(lineData);

        var l = svg.selectAll(".line")
            .data([lineData]);

        l
            .enter()
            .append("path")
            .attr("class","line")
            .merge(l)
            .transition()
            .duration(750)
            .attr("d", valueline)

        u
            .enter()
            .append(".dot") // Add a new circle for each new elements
            .merge(u) // get the already existing elements as well
            .transition() // and apply changes to all of them
            .duration(750)
                .attr("cx", function(d) { return x(d.date) })
                .attr("cy", function(d) { return y(d.count) })
                .attr("r", 5);

        t
            .enter()
            .append("text")
            .merge(t)
            .transition()
            .duration(750)
            .attr("class", "label")
                .attr("x", function(d, i) { return x(d.date) })
                .attr("y", function(d) { return y(d.count) })
                .attr("dy", "-5")
                .text(function(d) {return d.count; });
    }

    scope.generateLineGraph = function(lineData) {
        lineData.sort(function(a,b){
            return new Date(b.date) - new Date(a.date);
        });

        var height  = 200;
        var width   = 700;
        var hEach   = 40;

        var margin = {top: 20, right: 15, bottom: 25, left: 25};

        width =     width - margin.left - margin.right;
        height =    height - margin.top - margin.bottom;

        var svg = d3.select('#data').append("svg")
        .attr("width",  width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // set the ranges
        var x = d3.scaleTime().range([0, width]);

        x.domain(d3.extent(lineData, function(d) { return d.date; }));


        var y = d3.scaleLinear().range([height, 0]);


        y.domain([d3.min(lineData, function(d) { return d.count; }) - 5, 100]);

        var valueline = d3.line()
                .x(function(d) { return x(d.date); })
                .y(function(d) { return y(d.count);  })
                .curve(d3.curveMonotoneX);

        svg.append("path")
            .data([lineData])
            .attr("class", "line")
            .attr("d", valueline);

        var xAxis_woy = d3.axisBottom(x).ticks(11).tickFormat(d3.timeFormat("%y-%b-%d")).tickValues(lineData.map(d=>d.date));

        svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis_woy);

        svg.selectAll(".dot")
            .data(lineData)
            .enter()
            .append("circle")
            .attr("class", "dot")
            .attr("cx", function(d) { return x(d.date) })
            .attr("cy", function(d) { return y(d.count) })
            .attr("r", 5);


        svg.selectAll(".text")
            .data(lineData)
            .enter()
            .append("text")
            .attr("class", "label")
            .attr("x", function(d, i) { return x(d.date) })
            .attr("y", function(d) { return y(d.count) })
            .attr("dy", "-5")
            .text(function(d) {return d.count; });

        svg.append('text')
            .attr('x', 10)
            .attr('y', -5)
    }

    scope.init();
})
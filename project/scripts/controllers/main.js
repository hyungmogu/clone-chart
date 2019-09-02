angular.module('gitCloneApp')
.controller('mainCtrl', function($scope, $http){
    let scope = $scope;

    scope.countTotal = 0;

    scope.init = function() {
        scope.getGraph().then(res => {
            console.log(res.data);
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
            // create date object
            console.log(item.date);
            item.date = new Date(parseInt(item.date)*1000);

            output.push(item);
        }

        return output;
    }


    scope.updateLineGraph = function(lineData) {
        var height  = 200;
        var width   = 700;

        var valueline = d3.line()
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d.count);  })
            .curve(d3.curveMonotoneX);

        var x = d3.scaleTime().range([0, width]);
        var y = d3.scaleLinear().range([height, 0]);

        x.domain(d3.extent(lineData, function(d) { return d.date; }));
        y.domain([d3.min(lineData, function(d) { return d.count; }) - 5, 100]);

        let svg = d3.select("#data").transition();
        let xAxis_woy = d3.axisBottom(x).ticks(11).tickFormat(d3.timeFormat("%y-%b-%d")).tickValues(lineData.map(d=>d.date));

        svg.select(".line")   // change the line
            .duration(750)
            .attr("d", valueline(data));
        svg.select(".x.axis") // change the x axis
            .duration(750)
            .call(xAxis_woy);
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
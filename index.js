
let pickSeasonButtons;
var currentPlayerSelected;
var currentquarterSelected;
var currentOpponentSelected;
var tooltip;

window.onload = (event) => {
    pickSeasonButtons = document.querySelectorAll(".button-pick-season")
    pickSeasonButtons.forEach(button => {
        button.addEventListener('click', buttonClicked);
    })
};

function buttonClicked(event) {
    event.preventDefault();
    loadAllForWantedSeason(event.target.value);

}

function loadAllForWantedSeason(season) {

    d3.json(season, function (shotsData) {

        currentPlayerSelected = shotsData[0].name;
        currentquarterSelected = 0;
        currentOpponentSelected = "any";
        loadOptions(shotsData);
        loadShotChart(shotsData);
        loadBarChartButtons(shotsData);
        loadTakenShotsBarChart(shotsData);
    });


}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

function loadOptions(playerShotsData) {
    d3.select("#value-step").html("");
    d3.select("#slider-step").html("");
    d3.select("#opponent-select").html("");
    d3.select("#choose-player").html("");
    d3.select("#choose-quarter").html("");
    d3.select("#choose-team").html("");

    d3.select("#choose-player").html("Choose player");
    d3.select("#choose-quarter").html("Choose quarter");
    d3.select("#choose-team").html("Choose opponent");

    var allNames = [];

    for (index in playerShotsData) {
        allNames.push(playerShotsData[index].name);
    }

    var names = allNames.filter(onlyUnique);

    var sliderStep = d3
        .sliderVertical()
        .min(1)
        .max(names.length)
        .height(650)
        .tickFormat(function (d, i) { return names[i] })
        .ticks(names.length)
        .step(1)
        .default(1)
        .on('onchange', val => {
            currentPlayerSelected = names[val - 1];
            loadShotChart(playerShotsData);

        });

    var gStep = d3
        .select('p#value-step')
        .append('svg')
        .attr('width', 200)
        .attr('height', 700)
        .append('g')
        .attr('transform', 'translate(120,10)');

    gStep.call(sliderStep);

    var quarters = ["any", 1, 2, 3, 4];

    var sliderquartersStep = d3
        .sliderBottom()
        .min(0)
        .max(4)
        .width(400)
        .tickFormat(function (d, i) { return quarters[i] })
        .ticks(5)
        .step(1)
        .default(0)
        .on('onchange', val => {
            currentquarterSelected = val;
            loadShotChart(playerShotsData);

        });

    var gquartersStep = d3
        .select('div#slider-step')
        .append('svg')
        .attr('width', 500)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(30,30)');

    gquartersStep.call(sliderquartersStep);

    var teams = ["any", "Atlanta Hawks", "Brooklyn Nets", "Charlotte Hornets", "Chicago Bulls", "Cleveland Cavaliers",
        "Dallas Mavericks", "Denver Nuggets", "Detroit Pistons", "Golden State Warriors", "Houston Rockets", "Indiana Pacers",
        "Los Angeles Clippers", "Los Angeles Lakers", "Memphis Grizzlies", "Miami Heat", "Milwaukee Bucks", "Minnesota Timberwolves",
        "New Orleans Pelicans", "New York Knicks", "Oklahoma City Thunder", "Orlando Magic", "Philadelphia 76ers", "Phoenix Suns",
        "Portland Trail Blazers", "Sacramento Kings", "San Antonio Spurs", "Toronto Raptors", "Utah Jazz", "Washington Wizards"];


    var select = d3.select('div#opponent-select')
        .append('select')
        .attr('class', 'select')
        .on('change', changeOpponent);


    var options = select.selectAll('option')
        .data(teams).enter()
        .append('option')
        .text(function (d) { return d; });


    function changeOpponent() {
        currentOpponentSelected = d3.select('select').property('value');
        loadShotChart(playerShotsData);

    }

}

function loadShotChart(playerData) {
    var maxSize = {
        x: 780,
        y: 650
    };


    var selectedPlayerData = [];

    for (index in playerData) {


        if (((currentquarterSelected === playerData[index].period) || (currentquarterSelected === 0)) && (currentPlayerSelected === playerData[index].name) && ((currentOpponentSelected === playerData[index].opponent) || (currentOpponentSelected === "any"))) {
            selectedPlayerData.push(playerData[index]);
        }
    }

    function setOpacity(playerInfo) {

        if (((currentquarterSelected === playerInfo.period) || (currentquarterSelected === 0)) && (currentPlayerSelected === playerInfo.name) && ((currentOpponentSelected === playerInfo.opponent) || (currentOpponentSelected === "any"))) {
            return 0.75;
        }

        else return 0.07;


    }

    var svg = d3.select("#shot-chart").html("");
    svg = d3.select("#shot-chart").append("svg:svg")
        .attr("width", maxSize.x)
        .attr("height", maxSize.y)
        .attr("background-color", "#122737")
        .style("background", 'url("court.jpg")')
        .style("background-size", "780px 650px")
        .append("g")
        .attr("id", "shotchart");

    var courtBGUrl = "court.jpg";
    svg.append("svg:defs")
        .append("svg:pattern")
        .attr("id", "bg")
        .attr('patternUnits', 'userSpaceOnUse')
        .attr("width", maxSize.x)
        .attr("height", maxSize.y)
        .append("svg:image")
        .attr("id", "image-url")
        .attr("width", maxSize.x)
        .attr("height", maxSize.y);

    svg.append("rect")
        .attr("x", "0")
        .attr("y", "0")
        .attr("width", maxSize.x)
        .attr("height", maxSize.y)
        .attr("fill", "url(#bg)");

    var xScale = d3.scaleLinear()
        .domain([-250, 250])
        .range([0, 780]);

    var yScale = d3.scaleLinear()
        .domain([-1, 0, -150])
        .range([590, 589, 371]);

    var colorValue = function (d) {
        if (d === 0) {
            return "#00cc00";
        }
        if (d === 1) {
            return "#ff0000";
        }
    }

    var xValue = function (d) {
        return xScale(-d);
    }

    var yValue = function (d) {
        return (yScale(-d));
    }

    var classByShot = function (d) {
        if (d === 0) {
            return "dot-missed";
        }
        if (d === 1) {
            return "dot-made";
        }
    }

    var tooltip = d3.select("#shot-chart")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden");

    d3.selectAll('dot').remove();
    var node = svg.selectAll("dot").data(playerData)
    node.enter()
        .append("svg:circle")
        .attr("r", 4)
        .attr("cx", function (d) { return xValue(d.x); })
        .attr("cy", function (d) { return yValue(d.y); })
        .attr("id", "shots-circle")
        .attr("opacity", function (d) { return setOpacity(d); })
        .attr("class", function (d) { return classByShot(d.shot_made_flag); })
        .style("fill", function (d) { return colorValue(d.shot_made_flag); })
        .on("mouseover", function (d) { return showShotInfo(d.game_date, d.shot_clock); })
        .on("mouseout", function () { return tooltip.style("visibility", "hidden"); });

    function showShotInfo(gameDate, timeLeft) {
        tooltip.style("visibility", "visible")
            .style("left", d3.event.pageX + "px")
            .style("top", d3.event.pageY + "px")
            .style("width", "200px")
            .style("background-color", "#ffff66")
            .html(`Game date: ${gameDate}<br>
                   Shotclock time: ${timeLeft}<br>`);
    }

    loadPieChart(selectedPlayerData);
    loadMakesAndMissesTwo(selectedPlayerData);
    loadMakesAndMissesThree(selectedPlayerData);
}

function loadPieChart(playerData) {
    var width = 500;
    var height = 500;
    var outerRadius = 200;
    var innerRadius = 0;

    var numberOfTwoPointers = 0;
    var numberofThreePointers = 0;

    for (i in playerData) {
        if (playerData[i].shot_type === "2PT Field Goal") {
            numberOfTwoPointers++;
        }

        else if (playerData[i].shot_type === "3PT Field Goal") {
            numberofThreePointers++;
        }
    }

    var data = [
        { name: "2 POINT SHOT", value: numberOfTwoPointers },
        { name: "3 POINT SHOT", value: numberofThreePointers }
    ]

    var colors = ["#ffcc00", "#0066cc"];

    var arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);

    var pie = d3.pie()
        .value(function (d) { return d.value; });

    d3.select("#types-of-shots").html("");
    d3.select("#types-of-shots-legend").html("");
    d3.selectAll(".pie-chart-items").style("border-style", "solid");

    var svg = d3.select("#types-of-shots")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    var tooltip = d3.select("#types-of-shots")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden");

    var pieArcs = svg.selectAll("g.pie")
        .data(pie(data))
        .enter()
        .append("g")
        .attr("class", "pie")
        .attr("transform", "translate(" + (width / 2) + ", " + (height / 2) + ")")
        .on("mouseover", function (d) { return showNumberOfShotsInfo(d.data.value); })
        .on("mouseout", function () { return tooltip.style("visibility", "hidden"); });

    function showNumberOfShotsInfo(numberOfShots) {
        tooltip.style("visibility", "visible")
            .style("left", d3.event.pageX + "px")
            .style("top", d3.event.pageY + "px")
            .style("width", "120px")
            .style("background-color", "#00e6e6")
            .html(`Number of shots: ${numberOfShots}<br>`);
    }

    pieArcs.append("path")
        .attr("fill", function (d, i) { return colors[i] })
        .attr("d", arc);

    if ((data[0].value != 0) || (data[1].value != 0)) {
        var legend = d3.select("#types-of-shots-legend")
            .append("svg")
            .attr("width", 150)
            .attr("height", 100)
            .style("background-color", "lightblue")

        legend.selectAll("mydots")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", 20)
            .attr("cy", function (d, i) { return 20 + i * 25 })
            .attr("r", 7)
            .style("fill", function (d, i) { return colors[i] })

        legend.selectAll("mylabels")
            .data(data)
            .enter()
            .append("text")
            .attr("x", 35)
            .attr("y", function (d, i) { return 20 + i * 25 }) 
            .text(function (d) { return d.name })
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
    }
}

function loadMakesAndMissesTwo(playerData) {
    var width = 500;
    var height = 500;
    var outerRadius = 200;
    var innerRadius = 0;

    var numberOfMakes = 0;
    var numberofMisses = 0;

    for (i in playerData) {
        if ((playerData[i].shot_type === "2PT Field Goal") && (playerData[i].shot_made_flag === 1)) {
            numberOfMakes++;
        }

        else if ((playerData[i].shot_type === "2PT Field Goal") && (playerData[i].shot_made_flag === 0)) {
            numberofMisses++;
        }
    }

    var data = [
        { name: "2PT MISSES", value: numberOfMakes },
        { name: "2PT MAKES", value: numberofMisses }
    ]

    var colors = ["#ff0000", "#00cc00"];

    var arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);

    var pie = d3.pie()
        .value(function (d) { return d.value; });

    d3.select("#two-pointers").html("");
    d3.select("#two-pointers-legend").html("");

    var svg = d3.select("#two-pointers")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    var tooltip = d3.select("#two-pointers")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden");

    var pieArcs = svg.selectAll("g.pie")
        .data(pie(data))
        .enter()
        .append("g")
        .attr("class", "pie")
        .attr("transform", "translate(" + (width / 2) + ", " + (height / 2) + ")")
        .on("mouseover", function (d) { return showNumberOfTwoPointShotsInfo(d.data.value); })
        .on("mouseout", function () { return tooltip.style("visibility", "hidden"); });

    function showNumberOfTwoPointShotsInfo(numberOfShots) {
        tooltip.style("visibility", "visible")
            .style("left", d3.event.pageX + "px")
            .style("top", d3.event.pageY + "px")
            .style("width", "120px")
            .style("background-color", "#ffff66")
            .html(`Number of shots: ${numberOfShots}<br>`);
    }

    pieArcs.append("path")
        .attr("fill", function (d, i) { return colors[i] })
        .attr("d", arc);

    if ((data[0].value != 0) || (data[1].value != 0)) {
        var legend = d3.select("#two-pointers-legend")
            .append("svg")
            .attr("width", 150)
            .attr("height", 100)
            .style("background-color", "lightblue")

        legend.selectAll("mydots")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", 20)
            .attr("cy", function (d, i) { return 20 + i * 25 })
            .attr("r", 7)
            .style("fill", function (d, i) { return colors[i] })

        legend.selectAll("mylabels")
            .data(data)
            .enter()
            .append("text")
            .attr("x", 35)
            .attr("y", function (d, i) { return 20 + i * 25 })
            .text(function (d) { return d.name })
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
    }
}

function loadMakesAndMissesThree(playerData) {
    var width = 500;
    var height = 500;
    var outerRadius = 200;
    var innerRadius = 0;

    var numberOfMakes = 0;
    var numberofMisses = 0;

    for (i in playerData) {
        if ((playerData[i].shot_type === "3PT Field Goal") && (playerData[i].shot_made_flag === 1)) {
            numberOfMakes++;
        }

        else if ((playerData[i].shot_type === "3PT Field Goal") && (playerData[i].shot_made_flag === 0)) {
            numberofMisses++;
        }
    }

    var data = [
        { name: "3PT MISSES", value: numberOfMakes },
        { name: "3PT MAKES", value: numberofMisses }
    ]

    var colors = ["#ff0000", "#00cc00"];

    var arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);

    var pie = d3.pie()
        .value(function (d) { return d.value; });


    d3.select("#three-pointers").html("");
    d3.select("#three-pointers-legend").html("");

    var svg = d3.select("#three-pointers")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    var tooltip = d3.select("#three-pointers")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden");

    var pieArcs = svg.selectAll("g.pie")
        .data(pie(data))
        .enter()
        .append("g")
        .attr("class", "pie")
        .attr("transform", "translate(" + (width / 2) + ", " + (height / 2) + ")")
        .on("mouseover", function (d) { return showNumberOfThreePointShotsInfo(d.data.value); })
        .on("mouseout", function () { return tooltip.style("visibility", "hidden"); });

    function showNumberOfThreePointShotsInfo(numberOfShots) {
        tooltip.style("visibility", "visible")
            .style("left", d3.event.pageX + "px")
            .style("top", d3.event.pageY + "px")
            .style("width", "120px")
            .style("background-color", "#ffff66")
            .html(`Number of shots: ${numberOfShots}<br>`);
    }


    pieArcs.append("path")
        .attr("fill", function (d, i) { return colors[i] })
        .attr("d", arc);

    if ((data[0].value != 0) || (data[1].value != 0)) {
        var legend = d3.select("#three-pointers-legend")
            .append("svg")
            .attr("width", 150)
            .attr("height", 100)
            .style("background-color", "lightblue")
        legend.selectAll("mydots")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", 20)
            .attr("cy", function (d, i) { return 20 + i * 25 })
            .attr("r", 7)
            .style("fill", function (d, i) { return colors[i] })

        legend.selectAll("mylabels")
            .data(data)
            .enter()
            .append("text")
            .attr("x", 35)
            .attr("y", function (d, i) { return 20 + i * 25 })
            .text(function (d) { return d.name })
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
    }
}

function loadBarChartButtons(playerData) {
    d3.select("#barchart-buttons").html("");

    var firstVariableButton = d3.select("#barchart-buttons")
        .append("button")
        .attr("type", "button")
        .attr("class", "btn-barchart")
        .attr("id", "btn-taken-shots")
        .style("width", "150px")
        .style("height", "50px")
        .style("margin", "5px")
        .text("Shots taken")
        .on("click", function () { loadTakenShotsBarChart(playerData) });

    var secondVariableButton = d3.select("#barchart-buttons")
        .append("button")
        .attr("type", "button")
        .attr("class", "btn-barchart")
        .attr("id", "btn-made-shots")
        .style("width", "150px")
        .style("height", "50px")
        .style("margin", "5px")
        .text("Shots made")
        .on("click", function () { loadMadeShotsBarChart(playerData) });
}

function loadTakenShotsBarChart(playerData) {
    d3.select("#player-stats").html("")

    var allNames = [];

    for (index in playerData) {
        allNames.push(playerData[index].name);
    }

    var names = allNames.filter(onlyUnique);
    var shotsPerPlayer = getPlayersShots(playerData, names);

    var margin = { top: 80, right: 30, bottom: 250, left: 80 },
        width = 740 - margin.left - margin.right,
        height = 820 - margin.top - margin.bottom

    var svg = d3.select("#player-stats")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("length", "auto")
        .attr("viewBox", "0 0 " + 700 + " " + 720)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    var x = d3.scaleBand()
        .range([0, width])
        .domain(names)
        .padding(0.2)

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end")
        .style("font-size", "1.5em")

    var y = d3.scaleLinear()
        .range([height, 0])
        .domain([0, Math.max(...shotsPerPlayer) + 50])

    svg.append("g")
        .call(d3.axisLeft(y))

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0 - (height / 2))
        .attr("y", 0 - (margin.left / 2))
        .style("text-anchor", "middle")
        .text("Shots taken")
        .style("font-size", "3rem")

    svg.selectAll("rect")
        .data(names)
        .enter()
        .append("rect")
        .attr("x", function (d) { return x(d) })
        .attr("y", function (d) { return y(0) })
        .attr("width", x.bandwidth())
        .attr("height", function (d) { return height - y(0) })
        .attr("fill", "#00cc66")

    svg.selectAll("rect")
        .transition()
        .duration(700)
        .attr("y", function (d, i) { return y(shotsPerPlayer[i]) })
        .attr("height", function (d, i) { return height - y(shotsPerPlayer[i]) })
        .delay(function (d, i) { return (i * 50) })

    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "1.5em")
        .text("Number of shots taken per season")
        .style("font-size", "2.5rem")

}


function getPlayersShots(playerData, names) {

    var counter = 0;
    var shotsArray = [];

    for (currentPlayer in names) {
        counter = 0;

        for (currentShot in playerData) {

            if (names[currentPlayer] === playerData[currentShot].name) {
                counter++;
            }
        }

        shotsArray.push(counter);
    }

    return shotsArray;
}

function loadMadeShotsBarChart(playerData) {
    d3.select("#player-stats").html("")

    var allNames = [];

    for (index in playerData) {
        allNames.push(playerData[index].name);
    }

    var names = allNames.filter(onlyUnique);

    var shotsPerPlayer = getPlayersMadeShots(playerData, names);
    var margin = { top: 80, right: 30, bottom: 250, left: 80 },
        width = 740 - margin.left - margin.right,
        height = 820 - margin.top - margin.bottom

    var svg = d3.select("#player-stats")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("length", "auto")
        .attr("viewBox", "0 0 " + 700 + " " + 720)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    var x = d3.scaleBand()
        .range([0, width])
        .domain(names)
        .padding(0.2)

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end")
        .style("font-size", "1.5em")

    var y = d3.scaleLinear()
        .range([height, 0])
        .domain([0, Math.max(...shotsPerPlayer) + 50])

    svg.append("g")
        .call(d3.axisLeft(y))

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0 - (height / 2))
        .attr("y", 0 - (margin.left / 2))
        .style("text-anchor", "middle")
        .text("Shots made")
        .style("font-size", "3rem")

    svg.selectAll("rect")
        .data(names)
        .enter()
        .append("rect")
        .attr("x", function (d) { return x(d) })
        .attr("y", function (d) { return y(0) })
        .attr("width", x.bandwidth())
        .attr("height", function (d) { return height - y(0) })
        .attr("fill", "#00cc66")

    svg.selectAll("rect")
        .transition()
        .duration(700)
        .attr("y", function (d, i) { return y(shotsPerPlayer[i]) })
        .attr("height", function (d, i) { return height - y(shotsPerPlayer[i]) })
        .delay(function (d, i) { return (i * 50) })

    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "1.5em")
        .text("Number of shots made per season")
        .style("font-size", "2.5rem")

}

function getPlayersMadeShots(playerData, names) {

    var counter = 0;
    var shotsArray = [];

    for (currentPlayer in names) {
        counter = 0;

        for (currentShot in playerData) {

            if ((names[currentPlayer] === playerData[currentShot].name) && (playerData[currentShot].shot_made_flag === 1)) {
                counter++;
            }
        }

        shotsArray.push(counter);
    }

    return shotsArray;
}

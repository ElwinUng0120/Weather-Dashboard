var APIKey = "166a433c57516f51dfab1f7edaed8413"; //Key for accessing OpenWeather's APIs

//Inserting contents for today's card
function makeTodayCard(response, toggle){
    if(toggle) $("#city").text("Toronto");
    $("#temp").text(`Temperature: ${response.current.temp} °C`);
    $("#windSpeed").text(`Wind Speed: ${response.current.wind_speed} KMPH`);
    $("#humid").text(`Humidity: ${response.current.humidity}%`);

    //Deteremine the color of the UV index badge
    if (response.current.uvi < 5) $("#indexUV").attr("class", "badge badge-warning");
    else if (response.current.uvi < 7) $("#indexUV").attr("class", "badge badge-orange");
    else if (response.current.uvi < 10) $("#indexUV").attr("class", "badge badge-danger");
    else if (response.current.uvi > 10) $("#indexUV").attr("class", "badge badge-violet");

    $("#indexUV").text(`${response.current.uvi}`);
    $("#icon").attr("src", `http://openweathermap.org/img/wn/${response.current.weather[0].icon}@2x.png`)
}

//Building the forcast cards
function makeForcastCards(daily, forcastDate){
    var icon = daily.weather[0].icon;
    var temp = daily.temp.day;
    var humid = daily.humidity;
    $("#forcastCardGroup").append(`
        <div class="card col-2 forcastCard">
            <div class="card-body">
                <h5 class="card-title" id="forcastDate">${forcastDate}</h5>
                <img src="http://openweathermap.org/img/wn/${icon}@2x.png" />
                <p class="card-text forcast">Temperature: ${temp} °C</p>
                <p class="card-text forcast">Humidity: ${humid}%</p>
            </div>
        </div>
    `);
}

//Send request to OpenWeather APIs
function sendRequest(event){

    if(event.originalEvent.key == "Enter") var city = $(".form-control").val();
    if(event.target.classList[0] == "listBtn") var city = event.target.textContent;

    var currentDate = moment();

    //Sending request to OpenWeather's Current Weather Data API
    $.ajax({
        url: `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIKey}`,
        method: "GET"
    }).then(function(response) {

        $("#city").text(response.name);

        //Sending request to OpenWeather's One Call API
        $.ajax({
            url: `https://api.openweathermap.org/data/2.5/onecall?lat=${response.coord.lat}&lon=${response.coord.lon}&exclude=minutely,hourly,alerts&units=metric&appid=${APIKey}`,
            method: "GET"
        }).then(function(response){
            //Generate contents for Today's card
            makeTodayCard(response, false);

            //Remove all forcast cards
            $("#forcastCardGroup").empty();

            //Generate contents for and build the forcast cards
            for(let i = 1; i < 6; i++) {
                forcastDate = currentDate.add(1, "day"); //Making dates for forcast carads
                makeForcastCards(response.daily[i], forcastDate.format("MM/DD/YYYY"));
            }
        });
    });
}

//Run these codes when the page is fully loaded
$(document).ready(function(){
    //Getting today's date
    var currentDate = moment();
    var forcastDate;
    $("#date").text(currentDate.format("(MM/DD/YYYY)"));
    
    //Sending request to OpenWeather's One Call API
    $.ajax({
        url: `https://api.openweathermap.org/data/2.5/onecall?lat=43.7&lon=-79.42&exclude=minutely,hourly,alerts&units=metric&appid=${APIKey}`,
        method: "GET"
    }).then(function(response) {
        //Generate contents for Today's card
        makeTodayCard(response, true);

        //Generate contents for and build forcast cards
        for(let i = 1; i < 6; i++) {
            forcastDate = currentDate.add(1, "day"); //Making dates for forcast carads
            makeForcastCards(response.daily[i], forcastDate.format("MM/DD/YYYY"));
        }
        console.log(response);
    });

    $("#searchBtn").on("click", sendRequest);
    $(".form-control").on("keydown", sendRequest);
    $(".listBtn").on("click", sendRequest);
});
require("dotenv").config();
var keys = require("./keys.js");
var fs = require("fs");
var request = require("request");
var Bandsintown = require("bandsintown");
var Spotify = require('node-spotify-api');
var moment = require('moment');
//users actions
var command = process.argv[2];
var commandArgv = process.argv.slice(3).join("+");
var textFile = "log.txt";
//Switch command
function mySwitch(command, commandArgv) {

    switch (command) {

        case "concert-this":
            getConcert(commandArgv);
            break;
        case "spotify-this-song":
            getSpotify(commandArgv);
            break;
        case "movie-this":
            getMovie(commandArgv);
            break;
        case "do-what-it-says":
            doWhat();
            break;
        default:
            console.log("Please use a valid command.")
            return;  
    }
}
    //Bandsintown - command: concert-this
    function getConcert(commandArgv) {
        //Fetch Bandsintown Keys
        var bandsintown = new Bandsintown(keys.bandsintown);
        var artist = commandArgv;
        // Then run a request to the Bandsintown API with the artist specified
        var queryUrl = "https://rest.bandsintown.com/artists/" + artist + "/events?app_id=BANDSINTOWN_ID&tracker_count=10";

        request(queryUrl, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                body = JSON.parse(body);
                for (var event in body) {
                    display("Venue: ", body[event].venue.name);
                    display("Location: ", body[event].venue.city + ", " + body[event].venue.region + ", " + body[event].venue.country);
                    var m = moment(body[event].datetime).format('MM/DD/YYYY, h:mm a').split(", ");
                    display("Date: ", m[0]);
                    display("Time: ", m[1]);
                    contentAdded();
                }
            } 
        });
    }
// Fetch Spotify Keys
var spotify = new Spotify(keys.spotify);

// Function for running a Spotify search - Command is spotify-this-song
function getSpotify(commandArgv) {
    var song = commandArgv;
    if (!song) {
      song = "The+Sign";
      console.log(song);
    }
    spotify.search({
      type: 'track',
      query: song
    }, function(err, data) {
      if (err) {
        return console.log('Error occurred: ' + err);
      }
      data = data.tracks.items[0];
      // console.log(data);
      display("Artist(s) Name: ", data.artists[0].name);
      display("Track Name: ", data.name);
      display("Preview URL: ", data.preview_url);
      display("Album: ", data.album.name);
      contentAdded();
    });
  }
    //OMDB Movie - command: movie-this
    function getMovie(commandArgv) {
        var movieName = commandArgv;
        if (!movieName) {
            movieName = "Mr.+Nobody"
          };
        var queryUrl = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&tomatoes=true&apikey=trilogy";
        request(queryUrl, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                body = JSON.parse(body);
                display("Title: ", body.Title);
                display("Year: ", body.Year);
                display("IMDB Rating: ", body.imdbRating);
                if (body.Ratings[2]) {
                display("Rotten Tomatoes Score: ", body.Ratings[2].Value);
                }
                display("Country: ", body.Country);
                display("Language: ", body.Language);
                display("Plot: ", body.Plot);
                display("Actors: ", body.Actors);
                contentAdded();
            }
        });
    }

    // do-what-it-says function
    function doWhat() {
        fs.readFile("random.txt", "utf8", function(error, data) {
        if (error) {
            return console.log(error);
        }
        var dataArr = data.replace(/(\r\n|\n|\r)/gm, "").split(",");
        for (var i = 0; i < dataArr.length; i += 2) {
            var command = dataArr[i];
            var commandArgv = dataArr[i + 1].replace(/['"]+/g, '').split(' ').join("+");
            mySwitch(command, commandArgv);
        }
        });
    }
    // console.log / appendFile function
    function display(description, data) {
        console.log(description + data);
        appendFile(description + data + "\n");
    }
    function contentAdded() {
        console.log("");
        console.log("Content Added!");
        console.log("-----------------------------------\n");
        appendFile("-----------------------------------\n");
      }
      //appendFile function
    function appendFile(commandArgv) {
        fs.appendFile(textFile, commandArgv, function(err) {
            if (err) {
                console.log(err);
            } else {}
    });
  }


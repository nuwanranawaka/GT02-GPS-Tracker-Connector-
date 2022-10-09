const net = require("net");
const server = net.createServer();

var gps = [];

server.listen(8090, function (err) {
  if (err) {
    return;
  }
});

const currentTime = () => {
  // Date object initialized as per Sri Lanka timezone. Returns a datetime string
  let sl_date_string = new Date().toLocaleString("en-US", {
    timeZone: "", // Set your time zone
  });

  // Date object initialized from the above datetime string
  let date_sl = new Date(sl_date_string);

  // year as (YYYY) format
  let year = date_sl.getFullYear();

  // month as (MM) format
  let month = ("0" + (date_sl.getMonth() + 1)).slice(-2);

  // date as (DD) format
  let date = ("0" + date_sl.getDate()).slice(-2);

  // hours as (HH) format
  let hours = ("0" + date_sl.getHours()).slice(-2);

  // minutes as (mm) format
  let minutes = ("0" + date_sl.getMinutes()).slice(-2);

  // seconds as (ss) format
  let seconds = ("0" + date_sl.getSeconds()).slice(-2);

  // date as YYYY-MM-DD format
  let date_yyyy_mm_dd = year + "-" + month + "-" + date;
  console.log("Date in YYYY-MM-DD format: " + date_yyyy_mm_dd);

  // time as hh:mm:ss format
  let time_hh_mm_ss = hours + ":" + minutes + ":" + seconds;
  console.log("Time in hh:mm:ss format: " + time_hh_mm_ss);

  // date and time as YYYY-MM-DD hh:mm:ss format
  let date_time =
    year +
    "-" +
    month +
    "-" +
    date +
    " " +
    hours +
    ":" +
    minutes +
    ":" +
    seconds;
  console.log("Date and Time in YYYY-MM-DD hh:mm:ss format: " + date_time);

  return date_time;
};

const process = (data) => {
  var ID = data.substr(1, 1 + 11);
  console.log("ID: " + ID);

  var gpsData = {};
  gpsData["device_id"] = ID;

  //date
  var offset = 17;
  var offset_end = 6;
  var date = data.substr(offset, offset_end);
  gpsData["date"] = date;
  console.log("date: " + date);

  //Available
  offset = 23;
  offset_end = 1;
  var available = data.substr(offset, offset_end);
  gpsData["available"] = available;
  console.log("Available: " + available);

  //Latitude
  offset = 24;
  offset_end = 9;
  var lat = data.substr(offset, offset_end);
  gpsData["latitude"] = lat;
  console.log("Latitude: " + lat);

  //Indicator de latitude
  offset = 33;
  offset_end = 1;
  var lat_in = data.substr(offset, offset_end);
  gpsData["indicator_lat"] = lat_in;
  console.log("Indicator lat: " + lat_in);

  //Longitude
  offset = 34;
  offset_end = 10;
  var lng = data.substr(offset, offset_end);
  gpsData["longitude"] = lng;
  console.log("Longitude: " + lng);

  //Indicator de longitude
  offset = 44;
  offset_end = 1;
  var lng_in = data.substr(offset, offset_end);
  gpsData["indicator_lng"] = lng_in;
  console.log("Indicator lng: " + lng_in);

  //Speed
  offset = 45;
  offset_end = 5;
  var speed = data.substr(offset, offset_end);
  gpsData["speed"] = speed;
  console.log("Speed: " + speed);

  //Hour
  offset = 50;
  offset_end = 6;
  var hour = data.substr(offset, offset_end);
  gpsData["hour"] = hour;
  console.log("Hour: " + hour);

  if ((available = "A")) {
    var lat_dd =
      parseFloat(lat.substr(0, 2)) + parseFloat(lat.substr(2, 9)) / 60;
    if (lat_in != "N") {
      lat_dd = -lat_dd;
    }
    var lng_dd =
      parseFloat(lng.substr(0, 3)) + parseFloat(lng.substr(3, 10)) / 60;
    if (lng_in != "E") {
      lng_dd = -lng_dd;
    }

    gpsData["lat"] = lat_dd;
    gpsData["lon"] = lng_dd;

    console.log("Lat: " + lat_dd);
    console.log("Lon: " + lng_dd);
  }

  var dateTime = currentTime();
  gpsData["datetime"] = dateTime;
  console.log("Server time: " + dateTime);

  return gpsData;
};

server.on("connection", function (sock) {
  sock.on("data", function (dataSet) {
    var data = dataSet.toString();

    if (typeof data != "string") {
      console.log("Error 1");
    }
    if (data.length < 19) {
      console.log("Error 2");
    }
    if (data[0] != "(" && data[data.length - 1] != ")") {
      console.log("Error 3");
    } else {
      // var ID    = data.substr(1,1+11);
      var command = data.substr(13, 4);
      // console.log("ID: "+ID);
      console.log("command: " + command);

      if (command == "BR00") {
        var tempArr = process(data);
        gps.push(tempArr);
      }

      if (command == "BP05" && data.includes("A") && data.includes("E")) {
        var iemi = data.substr(16, 15);
        data = data.replace(iemi, "");
        var tempArr = process(data);
        gps.push(tempArr);
      }
    }

    if (gps.length > 0) {
      for (const element of gps) {
        /**
         * Connect to API
         */
      }
    }
  });
});

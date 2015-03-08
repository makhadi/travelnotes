/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
$(function() {
    var i=0;
    var NoteTaker = {};
    (function(app) {
        
        var $ul = $('#locationsList'),
                locationsHdr = '<li data-role="list-divider">Your Locations</li>',
                noLocations = '<li id="noLocations">You have no saved locations</li>';
        
        app.init = function() {
            app.bindings();
            Db = window.openDatabase("etDB", "1.0", "TravelNotes", 3 * 1024 * 1024);
            
            if (Db)
            {
                Db.transaction(createTable, onTxError, onTxSuccess);
            }
            else
            {
                alert("this code shouldn't ever execute");
            }
        };
        
        app.bindings = function() {
            $('#addloc').on('click', function(e) {
                e.preventDefault();
                app.addLocationPage();
                $.mobile.changePage('addlocation.html');
            });

            $(document).on('click', '#addlocationbutton', function(e) {
                e.preventDefault();
                app.saveLocation();
                $("#locationname").val('');
                alert("Location saved.");
            });
            
            $(document).on('click', '#addnotebutton', function(e) {
                e.preventDefault();
                
                app.saveNote();
            });
            
            $(document).on('click', '#viewlocations', function(e) {
                e.preventDefault();
                //app.viewLocations();
                //$.mobile.changePage('listlocations.html',{transition: "none", reloadPage:true});
                window.location.href = "listlocations.html";
            });
            
            $(document).on('click', '#viewnotes', function(e) {
                e.preventDefault();
                window.location.href = "viewnotes.html";
            });
            
            $(document).on('click', '#addnote', function(e) {
                e.preventDefault();
                window.location.href = "addnote.html";
            });
            
            $(document).on('click', '#notesList a', function(e) {
                e.preventDefault();
                var href = $(this)[0].href.match(/\?.*$/)[0];
                var key = href.replace(/^\?key=/, '');
                localStorage.setItem("notekey",key);
                window.location.href = "viewnotedetails.html";
            });
            
            $(document).on('click', '#locationsList a', function(e) {
                e.preventDefault();
                var href = $(this)[0].href.match(/\?.*$/)[0];
                var key = href.replace(/^\?key=/, '');
                localStorage.setItem("locationkey",key);
                window.location.href = "viewlocationdetails.html";
            });
            
            $(document).on('click', '#checklocation', function(e) {
                e.preventDefault();
                app.checkLocation();
                //app.viewLocations();
                //$.mobile.changePage('listlocations.html',{transition: "none", reloadPage:true});
                //window.location.href = "listlocations.html";
            });
            
        };
        
        app.getDistance = function(lat1, lon1, lat2, lon2, unit) {
            var radlat1 = Math.PI * lat1/180;
            var radlat2 = Math.PI * lat2/180;
            var radlon1 = Math.PI * lon1/180;
            var radlon2 = Math.PI * lon2/180;
            var theta = lon1-lon2;
            var radtheta = Math.PI * theta/180;
            var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);;
            dist = Math.acos(dist);
            dist = dist * 180/Math.PI;
            dist = dist * 60 * 1.1515;
            if (unit=="K") { dist = dist * 1.609344; }
            if (unit=="N") { dist = dist * 0.8684; }
            return dist;
        }
        
        app.checkLocation = function(){
          //getting the current location
          id = navigator.geolocation.watchPosition(success, error, options);
          var id, target, options;

        function success(pos) {
            var flag=false;
            var crd = pos.coords;
            var curLatStr = crd.latitude.toString();
            var curLatitude = curLatStr.substring(0,6);
            var curLongStr = crd.longitude.toString();
            var curLongitude = curLongStr.substring(0,8);
            var distance = app.getDistance(crd.latitude, crd.longitude, target.latitude, target.longitude, "K");
            //alert("Distance: "+distance);
            var locations = app.getLocations();
            if (!$.isEmptyObject(locations)) {
            var n;
            var html = '';
            for (n in locations) {
                var location = locations[n];
                //html += li.replace(/ID/g, n.replace(/-/g, ' ')).replace(/LINK/g, n);
                var avaLatStr = location.lat.toString();
                var avaLatitude = avaLatStr.substring(0,6);
                var avaLongStr = location.long.toString();
                var avaLongitude = avaLongStr.substring(0,8);
                var dist;
                dist = app.getDistance(location.lat, location.long, crd.latitude, crd.longitude, "K");
                //if (curLatitude === avaLatitude && curLongitude === avaLongitude) {
                if(dist < 0.01){
                    var notes = app.getNotes();
                if (!$.isEmptyObject(notes)) {
                    var n;
                    for (n in notes) {
                        var note = notes[n];
                        if(location.locationname === note.location){
                            alert(location.locationname +": "+note.description);
                            flag=true;
                        }
                    }
                }
                }
            }
        }
            if(flag === true){
                //alert("cleared");
                navigator.geolocation.clearWatch(id);
            } else {
                //alert("repeating");
                alert("Lat: "+curLatStr +" Long: "+curLongStr);
            }
        };

        function error(err) {
            alert('ERROR(' + err.code + '): ' + err.message);
        };

        target = {
            latitude : 37.4813972,
            longitude: -121.9257914,
        }

        options = {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 0
            };
        };
        
        app.getNotes = function() { 
            var notes = localStorage['notes'];
            return JSON.parse(notes);
        }
        
        app.getLocations = function() {
            var locations = localStorage['locations'];
            return JSON.parse(locations);
        };
        
        app.viewLocations = function(){
            var locations = app.getLocations();
            if (!$.isEmptyObject(locations)) {
            var n;
            var html = '';
            for (n in locations) {
                var location = locations[n];
                html += li.replace(/ID/g, n.replace(/-/g, ' ')).replace(/LINK/g, n);
            }
                //$("#locationsList").html(locationsHdr+html);
                //$("#locationcontents").html("<p>Fetching data...</p>");
                //var t = $('#temp').val();
                //alert(t);
                //$('#temp').val("test");
                //var b = $('#temp').val();
                //alert(b);
                //$ul.html(locationsHdr + html).listview('refresh');
            } else {
                $ul.html(locationsHdr + noLocations).listview('refresh');
            }
        };
        
        app.saveNote = function() {
            var category = $('#category').val();
            var selectedLoc = $('#locationdd').val();
            var description = $('#description').val();
            if(description === ''){
                $('#descmsg').html("Description cannot be empty.");
                exit;
            }
            if(selectedLoc === '-Select Location-'){
                $('#locmsg').html("Location cannot be empty.");
                exit;
            }
            var location;
            var locations = app.getLocations();
            for (n in locations) {
                location = locations[selectedLoc];
            }
            var notes = localStorage.getItem("notes");
            
            jsonValue = {
                "category":category,
                "description":description,
                "location":selectedLoc,
                "lat":location.lat,
                "long":location.long
            };
            
            if (notes == undefined || notes == '') {
                  var notesObj={};
            } else {
                var notesObj = JSON.parse(notes)
            }
            var currentDate = new Date();
            var key = currentDate+"";
            key = key.replace(/\s+/g, '');
            notesObj[category+key]=jsonValue;
            localStorage['notes'] = JSON.stringify(notesObj);
            $("#description").val('');
            alert("Note added.");

        };
        
        app.saveLocation = function() {
            var lat = localStorage.getItem("latitude");
            var long = localStorage.getItem("longitude");
            var locationname = $('#locationname').val();
            var locations = localStorage['locations'];
            
            if(locationname === ''){
                $('#locnmsg').html("Location name cannot be empty.");
                exit;
            }
            
            jsonValue = {
                "locationname":locationname,
                "lat":lat,
                "long":long
            };
            
            if (locations == undefined || locations == '') {
                  var locationsObj={};
            } else {
                var locationsObj = JSON.parse(locations)
            }
            locationsObj[locationname]=jsonValue;
            localStorage['locations'] = JSON.stringify(locationsObj);
        };
        
        app.addLocationPage = function () {
       	    var locOptions = { enableHighAccuracy: true};
            navigator.geolocation.getCurrentPosition(onLocationSuccess, onLocationError, locOptions);
            function onLocationSuccess(position) {
                var lat = position.coords.latitude;
                var long = position.coords.longitude;
                $('#latitudetext').val(lat);
                $('#longitudetext').val(long);
                localStorage.setItem("latitude",lat);
                localStorage.setItem("longitude",long);
                alert("Lat: "+lat+" Long: "+long);
            }
            function onLocationError(error){
                alert("error: "+error.message);
            }
        };
        
        function createTable(tx)
        {
            var sqlStr = 'CREATE TABLE IF NOT EXISTS LOCATION (lname TEXT, latcol TEXT, longcol TEXT)';
            tx.executeSql(sqlStr, [], onSqlSuccess, onSqlError);
        }
        
        function onTxSuccess()
{
    console.log("TX: success");
}

function onTxError(tx, err)
{
    console.log("Entering onTxError");
    var msgText;
    //Check if we get an error object?
    if (err)
    {
        //Tell the user what happened
        msgText = "TX: " + err.message + " (" + err.code + ")";
    }
    else
    {
        msgText = "TX: Unkown error";
    }
    console.error(msgText);
    alert(msgText);
    console.log("Leaving onTxError");
}

function onSqlSuccess(tx, res)
{
    console.log("SQL: success");
    if (res)
    {
        console.log(res);
    }
}

function onSqlError(tx, err)
{
    console.log("Entering onSqlError");
    var msgText;
    if (err)
    {
        msgText = "SQL: " + err.message + " (" + err.code + ")";
    }
    else
    {
        msgText = "SQL: Unknown error";
    }
    console.error(msgText);
    alert(msgText);
    console.log("Leaving onSqlError");
}

function saveRecord()
{
    console.log("Entering saveRecord");
    //Make sure we have a valid date before trying to save the entry

    //Make sure amount > 0 before trying to save the entry

    //Write the record to the database
    Db.transaction(insertRecord, onTxError, onTxSuccess);
    console.log("Leaving saveRecord");
}

function insertRecord(tx)
{
    var lat = localStorage.getItem("latitude");
    var long = localStorage.getItem("longitude");
    var locationname = $('#locationname').val();
    var sqlStr = 'INSERT INTO LOCATION (lname, latcol, longcol) VALUES (?, ?, ?)';
    tx.executeSql(sqlStr, [locationname, lat, long], onSqlSuccess, onSqlError);
    
    //Reset the form by setting a blank value for the input values
    // using the jQuery $ selector
    var blankVal = {
        value: ''
    };
    $("#locationname").attr(blankVal);
}

function openView()
{
    console.log("Entering openView");
    var headerTxt, sqlStr;
    sqlStr = "SELECT * FROM LOCATION";
    //Set the heading on the page
    //$("#viewTitle").html(headerTxt);
    
    Db.transaction(function(tx) {
        tx.executeSql(sqlStr, [], onQuerySuccess, onQueryFailure);
    }, onTxError, onTxSuccess);
    console.log("Leaving openView");
}

function onQuerySuccess(tx, results)
{
    console.log("Entering onQuerySuccess");
    if (results.rows)
    {
        console.log("Rows: " + results.rows);
        var htmlStr = "";
        var len = results.rows.length;
        if (len > 0)
        {
            for (var i = 0; i < len; i++)
            {
                var locname = results.rows.item(i).locationname;
                htmlStr += '<b>LocationDB Name: </b> ' + locname + ' <br/>';

                //Check to see if there are any notes before writing
                // anything to the page
                //var notes = results.rows.item(i).notes;
                //htmlStr += '<b>Notes:</b> ' + notes + '<br />';
                //htmlStr += '<hr />';
            }

            $("#viewData").html(htmlStr);
            //Open the View page to display the data
            $.mobile.changePage("#dataView", "slide", false, true);
        }
        else
        {
            //This should never happen
            alert("No rows.");
        }
    }
    else
    {
        alert("No records match selection criteria.");
    }
    console.log("Leaving openView");
}

function onQueryFailure(tx, err)
{
    console.log("Entering onQueryFailure");
    var msgText;
    if (err)
    {
        msgText = "Query: " + err;
    }
    else
    {
        msgText = "Query: Unknown error";
    }
    console.error(msgText);
    alert(msgText);
    console.log("Leaving onQueryFailure");
    }
        app.init();
        
    })(NoteTaker);
});
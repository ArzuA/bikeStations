//Create the Google Map
function initMap() {

    var mapCanvas = document.getElementById('stations-map');
    var mapOptions = {
      center: new google.maps.LatLng(43.653226, -79.3831843),
      zoom: 14,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControlOptions: { style: google.maps.MapTypeControlStyle.DROPDOWN_MENU }
    }
    var map = new google.maps.Map(mapCanvas, mapOptions);

    stationManager(map);
}

function stationManager(map) {

    // Private:

    var _self = this;

    // Public

    this.infowindow = new google.maps.InfoWindow({});
    // Backbone template
    this.fTemplate = _.template(jQuery('#station-detail-template').html());

    this.createOption = function(value, name) {
        var option = document.createElement('option');
        option.value = value;
        option.text = name;
        return option;
    }

    this.createMarker = function(lat, lng, name) {
        // Create a point with Google LatLng object to pass to marker
        var point = new google.maps.LatLng(lat, lng);

        /*var iconBase = 'https://maps.google.com/mapfiles/kml/paddle/';
        var iconSuffix;

        if (station.availableBikes > 0 && station.availableDocks > 0) {
            iconSuffix = 'orange-circle.png';
        } else {
            iconSuffix = 'orange-circle.png';
        }*/

        // Create the Google Marker Point with the LatLng object
        var marker = new google.maps.Marker({
            position : point,
            map : map,
            title : name,
            /*icon : {
                url: iconBase + iconSuffix,
                origin: new google.maps.Point(0, 0),
                //anchor: new google.maps.Point(parseFloat(25),parseFloat(25)),
                scaledSize: new google.maps.Size(parseFloat(35),parseFloat(35))
            }*/
        });
        return marker;
    }

    this.createInfoWindow = function(name, statusValue, availableBikes, availableDocks) {
        var contentString=
            '<div class="station-window">' +
                // Sets a temporary padding, this helps the station name stay on all one line. Google maps doesn't like the text-transform:uppercase without this
                '<h2 class="temp-padding" style="padding-right: 1.5em">' + name + '</h2>' +
                //Show small message if the station is planned or show the details table
                (statusValue == 'Planned' ? "<i>(planned station)</i>" :
                    //if we have don't have sponsorship info:....
                    '<div class="station-data">' +
                        '<table id="station-table">' + 
                            '<tr><th>Available Bikes:</th><td>' + availableBikes + '</td></tr>' +
                            '<tr><th>Available Docks:</th><td>' + availableDocks + '</td></tr>' +
                        '</table>'  +
                    '</div>'
                ) +
            '</div>';

        var div = document.createElement('div');
        div.innerHTML = contentString;

        // Set the content in the infowindow
        var stationInfoWindow = _self.infowindow.setContent(div);

        return stationInfoWindow;
    }

    this.addCssToInfoWindow = function() {
        // Resets the h2 padding back to zero
        $('.temp-padding').css('padding-right', '0');

        // Get the height of the table, to base the margin of the image and the table off of one another
        var table_height = $('#station-table').height();

        // Set the top margin of the table to a relative value of the image size, if the table is smaller than the image
        var table_margin = ($('.sponsor-img').attr("height") - table_height) / 2;
        table_margin = Math.max(table_margin, 0);
        $('.station-data-w-table').css('margin-top', table_margin);

        // Set the top margin of the image to a relative value of the table size, if the image is smaller than the table
        var img_margin = (table_height - $('.sponsor-img').attr("height")) / 2;
        img_margin = Math.max(img_margin, 0);
        $('.sponsor-img').css('margin-top', img_margin);
    }

    this.changeStationListDetail = function(stationList) {
        //Change the details about stations
        $('#stations-list').change(function() {
            var selectedStationIndex = $(this).val();
            $("#station-details").html(_self.fTemplate($(stationList)[selectedStationIndex]));
        });
    }

    this.getStations = function() {
        jQuery.ajax("/torontoBikes").done(function(data){
            $(data.stationBeanList).each(function(i, station) {
                //Station Details
                var name = station.stationName;
                var lat = station.latitude;
                var lng = station.longitude;
                var availableBikes = station.availableBikes;
                var availableDocks = station.availableDocks;
                var statusValue = station.statusValue;

                //Create option list to select station by name
                var option = _self.createOption(i, name);
                $('#stations-list').append($(option));

                if (statusValue != 'Not In Service'  ) {
                    var marker = _self.createMarker(lat, lng, name);
                    var point = marker.position;
                    // Create a new instance of LatLngBounds to use for re-centering the map after all the stations are loaded
                    var bounds = new google.maps.LatLngBounds();

                    // Add an Event Listener that pops up the infoWindow when a user clicks a station
                    google.maps.event.addListener(marker, 'click', function() {
                        //Create info Window
                        _self.createInfoWindow(name, statusValue, availableBikes, availableDocks);

                        // Open the InfoWindow
                        _self.infowindow.open(map, marker);

                        // Add an event listener that runs when the station infowindow is fully popped-up.
                        google.maps.event.addListener(_self.infowindow, 'domready', function() {
                            _self.addCssToInfoWindow();
                        });
                    });
                    bounds.extend(point);
                }
            });
            //Change the details about stations
            _self.changeStationListDetail(data.stationBeanList);

        }).fail(function(err){
            alert(err);
        });
    }
    _self.getStations();
}

google.maps.event.addDomListener(window, 'load', initMap);
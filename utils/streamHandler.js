module.exports = function(stream, io) {
    // When tweets get sent our way ...
    stream.on('data', function(data) {
        // Construct a new tweet object
        var tweet = {
            twid: data['id'],
            active: false,
            author: data['user']['name'],
            avatar: data['user']['profile_image_url'],
            body: data['text'],
            date: data['created_at'],
            screenname: data['user']['screen_name'],
            geo: data["geo"],
            coordinates: data["coordinates"]
        };
        // Create a new model instance with our object
        var tweetEntry = new Tweet(tweet);
        tweetEntry.save(function(err) {

            if (!err) {
                // If everything is cool, socket.io emits the tweet.
                io.emit('tweet', tweet);
            }
        });
        if (data["user"].location) {
          io.emit("twitter-place", data["user"].location);          
        }
        if (data.place) {
            if (data.place.bounding_box === 'Polygon') {
                // Calculate the center of the bounding box for the tweet
                var coord, _i, _len;
                var centerLat = 0;
                var centerLng = 0;
                for (_i = 0, _len = coords.length; _i < _len; _i++) {
                    coord = coords[_i];
                    centerLat += coord[0];
                    centerLng += coord[1];
                }
                centerLat = centerLat / coords.length;
                centerLng = centerLng / coords.length;

                // Build json object and broadcast it
                var outputPoint = {
                    "lat": centerLat,
                    "lng": centerLng
                };
                console.log(outputPoint)

                io.emit("twitter-stream", outputPoint);

            }
        }

        if (data.coordinates) {
            if (data.coordinates !== null) {
                var outputPoint = {
                    "lat": data.coordinates.coordinates[0],
                    "lng": data.coordinates.coordinates[1]
                };
                //Send out to web sockets channel.
                io.emit('twitter-stream', outputPoint);
                // Save 'er to the database
            }
        }

    });

};
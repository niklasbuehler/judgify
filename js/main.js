var access_token = null;

function addToTable(artist) {
		console.log(artist)
		var table = document.getElementById('table');
		var tr = document.createElement('tr');
		var img = "<img src='"+artist.images[0]["url"]+"' class='artist-image rounded-circle'>";
		var name = "<a target='_blank' href='"+artist.external_urls["spotify"]+"'>"+artist.name+"</a>";

		var pop_color = '#1DB954';
		var badge = '';
		if (artist.popularity < 30) {
				pop_color = '#343a40';
				badge = " <span class='badge badge-dark'>Extreme rare</span>"
		} else if (artist.popularity < 50) {
				pop_color = '#dc3545';
				badge = " <span class='badge badge-danger'>Super rare</span>";
		} else if (artist.popularity < 60) {
				pop_color = '#ffc107';
				badge = " <span class='badge badge-warning'>Rare</span>";
		}
		var popularity = '<div class="progress"><div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="background-color: '+pop_color+'; width: '+(100-artist.popularity)+'%;" aria-valuenow="'+(100-artist.popularity)+'" aria-valuemin="0" aria-valuemax="100">'+(100-artist.popularity)+'</div></div>' + badge;

		tr.innerHTML = '<td>' + [img,name,popularity].join('</td><td>') + '</td>';
		table.appendChild(tr);
}

function implicitGrantFlow() {
		/* If access token has been assigned in the past and is not expired, no request required. */
		if (sessionStorage.getItem("accessToken") !== null &&
				sessionStorage.getItem("tokenTimeStamp") !== null &&
				upTokenTime < tokenExpireSec) {
				var timeLeft = (tokenExpireSec - upTokenTime);
				console.log("Token still valid: " + Math.floor(timeLeft / 60) + " minutes left.");

				/* Navigate to the home page. */
				$(location).attr('href', "index.html");
		} else {
				console.log("Token expired or never found, getting new token.");
				$.ajax({
						url: 'https://accounts.spotify.com/authorize',
						type: 'GET',
						contentType: 'application/json',
						data: {
								client_id: "33b5c70099024747b71c4dcb160d51ba",
								redirect_uri: "https://niklasbuehler.github.io/spodiffy",
								scope: "user-top-read",
								response_type: "code",
								//state: state
						}
				}).done(function callback(response) {
						/* Redirect user to home page */
						console.log("Sucessfully fetched token.");
						//$(location).attr('href', this.url);

				}).fail(function (error) {
						/* Since we cannot modify the server, we will always fail. */
						console.log("Error fetching token: " + error.status);
						console.log(this.url);
						//$(location).attr('href', this.url);
				});
		}
}

function getAccessToken() {

		access_token = sessionStorage.getItem("accessToken");

		if (access_token === null) {
				if (window.location.hash) {
						console.log('Getting Access Token');

						var hash = window.location.hash.substring(1);
						var accessString = hash.indexOf("&");

						/* 13 because that bypasses 'access_token' string */
						access_token = hash.substring(13, accessString);
						console.log("Access Token: " + access_token);

						/* If first visit or regaining token, store it in session. */    
						if (typeof(Storage) !== "undefined") {
								/* Store the access token */
								sessionStorage.setItem("accessToken", access_token); // store token.

								/* To see if we need a new token later. */
								sessionStorage.setItem("tokenTimeStamp", secondsSinceEpoch);

								/* Token expire time */
								sessionStorage.setItem("tokenExpireStamp", secondsSinceEpoch + 3600);
								console.log("Access Token Time Stamp: "
										+ sessionStorage.getItem("tokenTimeStamp")
										+ " seconds\nOR: " + dateNowMS + "\nToken expires at: "
										+ sessionStorage.getItem("tokenExpireStamp"));
						} else {
								alert("Your browser does not support web storage...\nPlease try another browser.");
						}
				} else {
						console.log('URL has no hash; no access token');
				}
		} else if (upTokenTime >= tokenExpireSec) {
				console.log("Getting a new acess token... Redirecting");

				/* Remove session vars so we dont have to check in implicitGrantFlow */
				sessionStorage.clear();

				$(location).attr('href', 'index.html'); // Get another access token, redirect back.

		} else {
				var timeLeft = (tokenExpireSec - upTokenTime);
				console.log("Token still valid: " + Math.floor(timeLeft / 60) + " minutes left.");
		}
}

function loadData() {
		$.ajax({
				url: "https://api.spotify.com/v1/me/top/artists?time_range=medium_term&limit=50&offset=0",
				beforeSend: function(xhr) {
						xhr.setRequestHeader("Authorization", "Bearer "+access_token)
				}, success: function(data){
						var artists;
						data.items.forEach(artist => addToTable(artist));
				}
		});
}

var access_token = null;
$("#alert").hide();

function populateView() {
		getAccessToken();
		loadData();
}

function getAccessToken() {
		access_token = sessionStorage.getItem("accessToken");

		if (access_token !== null) return;

		if (window.location.hash !== "") {
				var url = new URL(window.location.href);
				access_token = location.hash.match(new RegExp('access_token=([^&]*)'))[1];

				console.log("Access Token: " + access_token);

				/* If first visit or regaining token, store it in session. */    
				if (typeof(Storage) !== "undefined") {
						/* Store the access token */
						sessionStorage.setItem("accessToken", access_token); // store token.
				} else {
						alert("Your browser does not support web storage...\nPlease try another browser.");
				}
		} else {
				$("#alert").show();
		}
}

function authorize() {
		if (sessionStorage.getItem("accessToken") === null) {
				$(location).attr('href', 'https://accounts.spotify.com/authorize?client_id=33b5c70099024747b71c4dcb160d51ba&scope=user-top-read&response_type=token&redirect_uri=https://niklasbuehler.github.io/spodiffy');
		}
}

function loadData() {
		if (access_token === null) return;

		$.ajax({
				url: "https://api.spotify.com/v1/me/top/artists?time_range=medium_term&limit=50",
				beforeSend: function(xhr) {
						xhr.setRequestHeader("Authorization", "Bearer "+access_token)
				}, success: function(data){
						data.items.forEach(artist => addToTable(artist));
						var total_rarity = determineRarity(data.items);
						setRarity(total_rarity);
				}
		});
}

function addToTable(artist) {
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

function determineRarity(artists) {
		var rarity = 0;
		artists.forEach(artist => rarity+=(100-artist.popularity));
		return rarity/artists.length;
}

function setRarity(total_rarity) {
	alert("Total Rarity: "+total_rarity);
}

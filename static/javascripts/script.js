// public/javascripts/script.js

// Movies module
var movies = (function() {
	// Private variables
	var movieList = [];
	var movieData = {};
	var i = 0;
	// Private functions
	// Format date for display
	var formatDate = function (date) {
		// Check if date is already a string (e.g., because it's still a placeholder)
		if(typeof(date)==="string"){
			// If yes, leave string unchanged
			return(date);
		}
		// If no, format the date
		else{
			var hours = date.getHours();
			var minutes = date.getMinutes();
			var seconds = date.getSeconds();
			hours = hours < 10 ? '0'+hours : hours;
			minutes = minutes < 10 ? '0'+minutes : minutes;
			seconds = seconds < 10 ? '0'+seconds : seconds;
			return (
				(date.getMonth() + 1) +
				"/" +
				date.getDate() +
				"/" +
				date.getFullYear() +
				" " +
				hours +
				":" +
				minutes +
				":" +
				seconds
			)
		}
	};
	// Refresh movie list table on page
	var drawMovieListTable = function() {
		// Clear movie table on page
		$('#movieListTableBody').empty();
		// Check if movie data is empty
		if(movieList.length===0){
			// If yes, display placeholder in table
			$('#movieListTableBody').append(
				"<tr><td colspan='13'><em>No movies in list</em></td></tr>"
			);		
		}
		// If no, copy data into table
		else {
			movieList.forEach(function(movieID) {
				$('#movieListTableBody').append(
					"<tr><td>" +
					movieData[movieID].title +
					"</td><td>" +
					movieData[movieID].releaseYear +
					"</td><td>" +
					movieData[movieID].netflixStreaming +
					"</td><td>" +
					movieData[movieID].amazonStreaming +
					"</td><td>" +
					formatDate(movieData[movieID].updatedStreaming) +
					"</td><td>" +
					movieData[movieID].amazonRental +
					"</td><td>" +
					movieData[movieID].iTunesRental +
					"</td><td>" +
					movieData[movieID].googlePlayRental +
					"</td><td>" +
					movieData[movieID].vuduRental +
					"</td><td>" +
					formatDate(movieData[movieID].updatedRental) +
					"</td><td>" +
					"<button type='button' class='btn btn-default updateInfoButton' data-movieid='" +
					movieID +
					"'><span class='glyphicon glyphicon-refresh'></span></button>" +
					"</td><td>" +
					"<button type='button' class='btn btn-default removeButton' data-movieid='" +
					movieID +
					"'><span class='glyphicon  glyphicon-remove'></span></button>" +
					"</td></tr>"
				);
			});
		}			
	};
	// Display error message associated with movie list
	var displayMovieListErrorMessage = function(errorMessage) {
		// Write error message to page
		$('#movieListErrorBox').html(
			'<div class="alert alert-warning" id="searchResultsErrorBox" display="none">' +
			'<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' + 
			errorMessage +
			'</div>');
		// Unhide error message section of page
		$('#movieListErrorBox').css("display","block")
	};
	// Clear error message associated with movie list
	var clearMovieListErrorMessage = function() {
		// Erase error messages from the page
		$('#movieListErrorBox').empty();
		// Hide error message section of page
		$('#movieListErrorBox').css("display","none")
	};
	// Update movie title and year for a particular movie ID (using CanIStream.It)
	var updateTitleAndYear = function(movieID) {
		console.log("Updating title/year for " + movieID);
		$.ajax({
			url: "http://www.canistream.it/services/search",
			data: {
				movieID: movieID,
			},
			// Use JSONP to avoid same origin policy issues
			dataType: "jsonp",
			// Callback function if request is successful
			success: function(data, textStatus, jqXHR) {
				// Clear any previous error message
				clearMovieListErrorMessage();
				// Check if movie is still in data
				if(movieID in movieData) {
					// If yes, copy query results into movie data
					movieData[movieID].title = data[0].title || "?";
					movieData[movieID].releaseYear = data[0].year || "?";
				}
				// Refresh movie table on page
				drawMovieListTable();
			},
			// Callback function if request is not successful
			error: function(jqXHR, textStatus, errorThrown) {
				console.log("Error encountered when updating " + movieID);
				console.log("jqXHR:");
				console.log(jqXHR);
				console.log("textStatus:");
				console.log(textStatus);
				console.log("errorThrown:");
				console.log(errorThrown);
				// Display an error message
				displayMovieListErrorMessage(
					'Server error encountered when updating title and release year for "' +
					movieID +
					'"'
				);
			}
		});		
	};
	// Extract human-readable streaming info from CanIStream.It data
	var extractStreamingInfo = function(queryResult, serviceName) {
		// Check if streaming service appears in results
		if(serviceName in queryResult) {
			// If yes, display "Y" (plus possibly price info)
			// Check if there is price info in results
			if('price' in queryResult[serviceName]) {
				// If yes, display price info in parentheses
				// Check if price is non-zero
				if(queryResult[serviceName]['price'] > 0) {
					// If yes, format price and include in parentheses
					return("<span class='glyphicon glyphicon-ok'></span> ($" + queryResult[serviceName]['price'] + ")");
				}
				// If no, omit price info
				else {
					return("<span class='glyphicon glyphicon-ok'></span>");
				}
			}
			// If no, omit price info
			else {
				return("<span class='glyphicon glyphicon-ok'></span>");
			}
		}
		// If no, display a blank
		else {
			return("");
		}
	};
	// Update instant streaming info for a particular movie ID (using CanIStream.It)
	var updateStreaming = function(movieID) {
		console.log("Updating instant streaming info for " + movieID);
		$.ajax({
			url: "http://www.canistream.it/services/query",
			data: {
				movieId: movieID,
				attributes: "1",
				mediaType: "streaming"
			},
			// Use JSONP to avoid same origin policy issues
			dataType: "jsonp",
			// Callback function if request is successful
			success: function(streamingResult, textStatus, jqXHR) {
				// Clear any previous error message
				clearMovieListErrorMessage();
				// Check if movie is still in data
				if(movieID in movieData){
					// If yes, copy query results into movie data
					movieData[movieID].netflixStreaming = extractStreamingInfo(streamingResult, 'netflix_instant');
					movieData[movieID].amazonStreaming = extractStreamingInfo(streamingResult, 'amazon_prime_instant_video');
					movieData[movieID].updatedStreaming = new Date();					
				}
				// Refresh movie table on page
				drawMovieListTable(movieData, movieList);
			},
			// Callback function if request is not successful
			error: function(jqXHR, textStatus, errorThrown) {
				console.log("Error encountered when updating instant streaming info for " + movieID);
				console.log("jqXHR:");
				console.log(jqXHR);
				console.log("textStatus:");
				console.log(textStatus);
				console.log("errorThrown:");
				console.log(errorThrown);
				// Display an error message
				displayMovieListErrorMessage(
					'Server error encountered when updating instant streaming info for "' +
					movieData[movieID].title +
					'"'
				);
			},
		});
	};
	// Update streaming rental info for a particular movie ID (using CanIStream.It)
	var updateRental = function(movieID) {
		console.log("Updating rental info for " + movieID);
		$.ajax({
			url: "http://www.canistream.it/services/query",
			data: {
				movieId: movieID,
				attributes: "1",
				mediaType: "rental"
			},
			// Use JSONP to avoid same origin policy issues
			dataType: "jsonp",
			// Callback function if request is successful
			success: function(data, textStatus, jqXHR) {
				// Clear any previous error message
				clearMovieListErrorMessage();
				// Check if movie is still in data
				if(movieID in movieData) {
					// If yes, copy results into movie data
					movieData[movieID].amazonRental = extractStreamingInfo(data, 'amazon_video_rental');
					movieData[movieID].iTunesRental = extractStreamingInfo(data, 'apple_itunes_rental');
					movieData[movieID].googlePlayRental = extractStreamingInfo(data, 'android_rental');
					movieData[movieID].vuduRental = extractStreamingInfo(data, 'vudu_rental');
					movieData[movieID].updatedRental = new Date();					
				}
				// Refresh movie table on page
				drawMovieListTable();
			},
			// Callback function if request is not successful
			error: function(jqXHR, textStatus, errorThrown) {
				console.log("Error encountered when updating rental info for " + movieID);
				console.log("jqXHR:");
				console.log(jqXHR);
				console.log("textStatus:");
				console.log(textStatus);
				console.log("errorThrown:");
				console.log(errorThrown);
				// Display an error message
				displayMovieListErrorMessage(
					'Server error encountered when updating streaming rental info for "' +
					movieData[movieID].title +
					'"'
				);
			}
		});		
	};
	// Save movie list
	var saveMovieList = function() {
		$.ajax({
			url: "../api/movielists",
			data: {
				movieList: movieList
			},
			type: "POST",
			dataType: "json",
			// Callback function if request is successful
			success: function(response, textStatus, jqXHR) {
				console.log("Saving movie data: success");
			},
			// Callback function if request is not successful
			error: function(jqXHR, textStatus, errorThrown) {
				// Display error message
				displayMovieListErrorMessage(
					'Server error encountered when saving list'
				);
			},
		});
	};
	var updateMoviePrivate = function(movieID) {
		console.log("Updating " + movieID);
		updateTitleAndYear(movieID);
		updateStreaming(movieID);
		updateRental(movieID);
	};
	var addMoviesPrivate = function(addMovieList) {
		// Check if any of these movies are already in movie list
		// Need to add this
		addMovieList.forEach(function(movieID) {
			// Check to see if movie is already in list
			if(jQuery.inArray(movieID, movieList) > -1) {
				// If yes, display an error message and move on to the next movie ID
				displayMovieListErrorMessage(
					'"' +
					movieData[movieID].title +
					'" is already in movie list'
				);
			}
			else {
				// If no, add movie to list and trigger update (which will in turn trigger table refresh)
				movieList.push(movieID);
				movieData[movieID] = {
					title: "?",
					releaseYear: "?",
					netflixStreaming: "?",
					amazonStreaming: "?",
					updatedStreaming: "Never",
					amazonRental: "?",
					iTunesRental: "?",
					googlePlayRental: "?",
					vuduRental: "?",
					updatedRental: "Never"
				};
				updateMoviePrivate(movieID);
			}
		});
		// Save movie list
		saveMovieList(movieList);
	};
	// Public functions
	return {
		updateMovie: updateMoviePrivate,
		addMovies: addMoviesPrivate,
		initializeMovies: function() {
			$.ajax({
				url: "../api/movielists",
				dataType: "json",
				// Callback function if request is successful
				success: function(response, textStatus, jqXHR) {
					addMovieList = response.movieList || [];
					movieData = {};
					addMoviesPrivate(addMovieList);
				},
				// Callback function if request is not successful
				error: function(jqXHR, textStatus, errorThrown) {
					// Display error message
					displayMovieListErrorMessage(
						'Server error encountered when initializing list'
					);
				},
			});
		},
		removeMovie: function(movieID) {
			// Remove movie from movie data
			delete movieData[movieID];
			// Remove every occurence of movieID from movieList
			// Handles edge case in which list has accumulated duplicates
			// Use jQuery.inArray of indexOf() or filter() for compatibility with older browsers
			while ((i = jQuery.inArray(movieID, movieList)) > -1) {
				movieList.splice(i,1);
			}
			// Refresh movie table on page
			drawMovieListTable();
			// Save movie list
			saveMovieList();			
		},
	};
})();


// Search results module
var searchResults = (function() {
	// Private variables
	var searchResultsData = {};
	var searchResultsList = [];
	var i = 0;
	// Private functions
	// Refresh search results table on page
	var drawSearchResultsTable = function() {
		// Clear search results table on page
		$('#searchResultsTableBody').empty();
		// Check if search results data is empty
		if(searchResultsList.length===0) {
			// If yes, display placeholder in table
			$('#searchResultsTableBody').append(
				"<tr><td colspan='3'><em>No search results</em></td></tr>"
			);
		}
		// If no, copy data into table
		else {
			searchResultsList.forEach(function(movieID) {
				$('#searchResultsTableBody').append(
					"<tr><td>" +
					searchResultsData[movieID].title +
					"</td><td>" +
					searchResultsData[movieID].releaseYear +
					"</td><td>" +
					"<button type='button' class='btn btn-default addButton' data-movieid='"+
					movieID +
					"'><span class='glyphicon  glyphicon-plus'></span></button>" +
					"</td></tr>"
				);
			});
		}
	}
	// Display error message associated with search results
	var displaySearchResultsErrorMessage = function(errorMessage) {
		// Write error message to page
		$('#searchResultsErrorBox').html(
			'<div class="alert alert-warning" id="searchResultsErrorBox" display="none">' +
			'<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' + 
			errorMessage +
			'</div>');
		// Unhide error message section of page
		$('#searchResultsErrorBox').css("display","block")
	}
	// Clear error message associated with search results
	var clearSearchResultsErrorMessage = function() {
		// Erase error message from page
		$('#searchResultsErrorBox').empty();
		// Hide error message section of page
		$('#searchResultsErrorBox').css("display","none")
	}
	// Public functions
	return {
		initializeSearchResults: function() {
			searchResultsData = {};
			searchResultsList = [];
			drawSearchResultsTable();
		},
		getSearchResults: function(searchTerm) {
			// Clear search results data
			searchResultsData = {};
			searchResultsList = [];
			console.log("Submitting search query for " + searchTerm);
			// Send search query
			$.ajax({
				url: "http://www.canistream.it/services/search",
				data: {
					movieName: searchTerm
				},
				// Use JSONP to avoid same origin policy issues
				dataType: "jsonp",
				// Callback function if request is successful
				success: function(searchResults, textStatus, jqXHR) {
					// Check if any search results were returned
					if(searchResults.length > 0) {
						// Is yes, clear error messages and copy search results into search results data object
						clearSearchResultsErrorMessage();
						searchResults.forEach(function(searchResult){
							var movieID = searchResult._id;
							searchResultsData[movieID] = {
								title: searchResult.title,
								releaseYear: searchResult.year
							};
							searchResultsList.push(movieID);
						});
					}
					else {
						// If no, display error message
						displaySearchResultsErrorMessage(
							'No search results for "' +
							searchTerm +
							'"'
						);
					}
				},
				// Callback function if request is not successful
				error: function(jqXHR, textStatus, errorThrown) {
					console.log("Error encountered when searching for " + searchTerm);
					console.log("jqXHR:");
					console.log(jqXHR);
					console.log("textStatus:");
					console.log(textStatus);
					console.log("errorThrown:");
					console.log(errorThrown);
					// Display error message
					displaySearchResultsErrorMessage(
						'Server error encountered when searching for "' +
						searchTerm +
						'"'
					);
				},
				// Callback function whether or not request was successful
				complete: function(jqXHR, textStatus) {
					// Refresh search results table on page
					drawSearchResultsTable();
					// Clear search box
					$('#searchBox').val('');
					// Re-enable the search button and search box
					$('#searchBox').prop('disabled', false);
					$('#searchButton').removeClass("disabled");
				}
			});			
		},
		removeSearchResult: function(movieID) {
			// Remove search result from search result data
			delete searchResultsData[movieID];
			// Remove every occurence of movieID from searchResultsList
			// Handles edge case in which list has accumulated duplicates
			// Use jQuery.inArray of indexOf() or filter() for compatibility with older browsers
			while ((i = jQuery.inArray(movieID,searchResultsList)) > -1) {
				searchResultsList.splice(i,1);
			}
			// Refresh search results table on page
			drawSearchResultsTable();
		}
	}
})();

// Run main function once page has finished loading
$(document).ready(function() {
	// Initialize main data objects
	// Initialize tables on page
	searchResults.initializeSearchResults();
	movies.initializeMovies();
	// Event handler if user clicks on Search buttton
	$('button.searchButton').click(function() {
		// Disable search button and search box
		$('#searchButton').addClass("disabled");
		$('#searchBox').prop('disabled', true);
		// Read user's input from search box
		var searchTerm = $('#searchBox').val();
		searchResults.getSearchResults(searchTerm);
	});
	// Event handler if user presses Enter key in Search box
	$('#searchBox').keyup(function(event) {
		if(event.keyCode===13) {
			// Click Search button
			$('button.searchButton').click();
		}
	});
	// Event handler if user clicks on add button next to a search result
	$(document).on('click','button.addButton', function() {
		// Extract movie ID from button data
		var movieID = $(this).data().movieid;
		// Extract corresponding search result from search result data
		searchResults.removeSearchResult(movieID);
		movies.addMovies([movieID]);
	});
	// Event handler if user clicks on Update button next to a movie
	$(document).on('click','button.updateInfoButton', function() {
		// Extract movie ID from button data
		var movieID = $(this).data().movieid;
		movies.updateMovie(movieID);
	});
	// Event handler if user clicks on Remove button next to a movie
	$(document).on('click','button.removeButton', function() {
		// Extract movie ID from button data
		var movieID = $(this).data().movieid;
		movies.removeMovie(movieID);
	});
});






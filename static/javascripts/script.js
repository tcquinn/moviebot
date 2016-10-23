// public/javascripts/script.js

// Movies module
var movies = (function() {
	// Private variables
	var movieList = [];
	var movieData = {};
	var titleYearFields = [
		{name: "title", CISIname: "title"},
		{name: "releaseYear", CISIname: "year"}
	];
	var subscriptionServiceFields = [
		{name: "subscriptionNetflix", CISIname: "netflix_instant"},
		{name: "subscriptionAmazon", CISIname: "amazon_prime_instant_video"}
	];
	var rentalServiceFields = [
		{name: "rentalAmazon", CISIname: "amazon_video_rental"},
		{name: "rentaliTunes", CISIname: "apple_itunes_rental"},
		{name: "rentalGooglePlay", CISIname: "android_rental"},
		{name: "rentalVudu", CISIname: "vudu_rental"}
	];
	var serviceFields = subscriptionServiceFields.concat(rentalServiceFields);
	var fields = titleYearFields.concat(serviceFields);
	var numMovieDataButtons = 2;
	// Private functions
	// Format date for display (currently unused)
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
	// Produce HTML for table cell from title/year data
	var movieDataCellHTML = function(movieDatum) {
		var cellHTML = "<td>";
		if (movieDatum.updating) {
			cellHTML += "Updating";
		}
		else if (!movieDatum.updated){
			cellHTML += "?";
		}
		else if (movieDatum.value) {
				cellHTML += movieDatum.value;
		}
		else if (movieDatum.available) {
			if (movieDatum.price) {
				cellHTML += "$" + movieDatum.price;
			}
			else {
				cellHTML += "<span class='glyphicon glyphicon-ok'></span>";
			}			
		}
		cellHTML += "</td>";
		return(cellHTML);
	};
	// Refresh movie list table on page
	var drawMovieListTable = function() {
		var rowHTML = "";
		// Clear movie table on page
		$('#movieListTableBody').empty();
		// Check if movie data is empty
		if (movieList.length===0) {
			// If yes, display placeholder in table
			rowHTML = "<tr>";
			rowHTML += "<td colspan='";
			rowHTML += fields.length + numMovieDataButtons;
			rowHTML +="'><em>No movies in list</em></td>";
			rowHTML += "</tr>";
			$('#movieListTableBody').append(rowHTML);		
		}
		// If no, copy data into table
		else {
			movieList.forEach(function(movieID) {
				rowHTML = "<tr>";
				fields.forEach(function(field) {
					rowHTML += movieDataCellHTML(movieData[movieID][field.name]);
				});
				rowHTML += "<td><button type='button' class='btn btn-default updateInfoButton' data-movieid='";
				rowHTML += movieID;
				rowHTML += "'><span class='glyphicon glyphicon-refresh'></span></button></td>";
				rowHTML += "<td><button type='button' class='btn btn-default removeButton' data-movieid='";
				rowHTML += movieID;
				rowHTML += "'><span class='glyphicon  glyphicon-remove'></span></button></td>";
				rowHTML += "</tr>";
				$('#movieListTableBody').append(rowHTML);
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
		// Check if movie is still in data
		if(movieID in movieData) {
			// If yes, set flags to indicate these fields are being updated
			titleYearFields.forEach(function(titleYearField) {
				movieData[movieID][titleYearField.name].updating = true;
			});
		};
		$.ajax({
			url: "http://www.canistream.it/services/search",
			data: {
				movieID: movieID,
			},
			// Use JSONP to avoid same origin policy issues
			dataType: "jsonp",
			// Callback function if request is successful
			success: function(data, textStatus, jqXHR) {
				var updateDate = new Date();
				// Clear any previous error message
				clearMovieListErrorMessage();
				// Check if movie is still in data
				if(movieID in movieData) {
					// If yes, copy query results into movie data
					titleYearFields.forEach(function(titleYearField) {
						movieData[movieID][titleYearField.name].value = data[0][titleYearField.CISIname] || "NA";
						movieData[movieID][titleYearField.name].updated = updateDate;
					});
				};
			},
			// Callback function if request is not successful
			error: function(jqXHR, textStatus, errorThrown) {
				// Display an error message
				displayMovieListErrorMessage(
					'Server error encountered when updating title and release year for "' +
					movieID +
					'"'
				);
			},
			// Callback function whether or not request was successful
			complete: function(jqXHR, textStatus) {
				// Check if movie is still in data
				if(movieID in movieData) {
					// If yes, remove flags to indicate these fields are no longer being updated
					titleYearFields.forEach(function(titleYearField) {
						delete movieData[movieID][titleYearField.name].updating;
					});
				}
				// Refresh movie table on page
				drawMovieListTable();
			}
		});		
	};
	// Update instant streaming info for a particular movie ID (using CanIStream.It)
	var updateSubscription = function(movieID) {
		// Check if movie is still in data
		if(movieID in movieData) {
			// If yes, set flags to indicate these fields are being updated
			subscriptionServiceFields.forEach(function(subscriptionServiceField) {
				movieData[movieID][subscriptionServiceField.name].updating = true;
			});
		};
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
			success: function(data, textStatus, jqXHR) {
				var updateDate = new Date();
				// Clear any previous error message
				clearMovieListErrorMessage();
				// Check if movie is still in data
				if(movieID in movieData){
					// If yes, copy query results into movie data
					subscriptionServiceFields.forEach(function(subscriptionServiceField) {
						movieData[movieID][subscriptionServiceField.name].updated = updateDate;
						movieData[movieID][subscriptionServiceField.name].available =
							(subscriptionServiceField.CISIname in data);						
					});
				}
			},
			// Callback function if request is not successful
			error: function(jqXHR, textStatus, errorThrown) {
				// Display an error message
				displayMovieListErrorMessage(
					'Server error encountered when updating instant streaming info for "' +
					movieData[movieID].title +
					'"'
				);
			},
			// Callback function whether or not request was successful
			complete: function(jqXHR, textStatus) {
				// Check if movie is still in data
				if(movieID in movieData) {
					// If yes, remove flags to indicate these fields are no longer being updated
					subscriptionServiceFields.forEach(function(subscriptionServiceField) {
						delete movieData[movieID][subscriptionServiceField.name].updating;
					});
				}
				// Refresh movie table on page
				drawMovieListTable();
			}
		});
	};
	// Update streaming rental info for a particular movie ID (using CanIStream.It)
	var updateRental = function(movieID) {
		// Check if movie is still in data
		if(movieID in movieData) {
			// If yes, set flags to indicate these fields are being updated
			rentalServiceFields.forEach(function(rentalServiceField) {
				movieData[movieID][rentalServiceField.name].updating = true;
			});
		};
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
				var updateDate = new Date();
				// Clear any previous error message
				clearMovieListErrorMessage();
				// Check if movie is still in data
				if(movieID in movieData) {
					// If yes, copy results into movie data
					rentalServiceFields.forEach(function(rentalServiceField) {
						movieData[movieID][rentalServiceField.name].updated = updateDate;
						movieData[movieID][rentalServiceField.name].available =
							(rentalServiceField.CISIname in data);						
						if (data[rentalServiceField.CISIname] && data[rentalServiceField.CISIname].price)
							movieData[movieID][rentalServiceField.name].price =
								data[rentalServiceField.CISIname].price;
					});
				}
			},
			// Callback function if request is not successful
			error: function(jqXHR, textStatus, errorThrown) {
				// Display an error message
				displayMovieListErrorMessage(
					'Server error encountered when updating streaming rental info for "' +
					movieData[movieID].title +
					'"'
				);
			},
			// Callback function whether or not request was successful
			complete: function(jqXHR, textStatus) {
				// Check if movie is still in data
				if(movieID in movieData) {
					// If yes, remove flags to indicate these fields are no longer being updated
					// If yes, set flags to indicate these fields are being updated
					rentalServiceFields.forEach(function(rentalServiceField) {
						delete movieData[movieID][rentalServiceField.name].updating;
					});
				}
				// Refresh movie table on page
				drawMovieListTable();
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
		updateSubscription(movieID);
		updateRental(movieID);
		updateTitleAndYear(movieID);
	};
	var addMoviesPrivate = function(addMovieList) {
		addMovieList.forEach(function(movieID) {
			// Check to see if movie is already in list
			if(jQuery.inArray(movieID, movieList) > -1) {
				// If yes, display an error message and move on to the next movie ID
				displayMovieListErrorMessage(
					'"' +
					movieData[movieID].title.value +
					'" is already in movie list'
				);
			}
			else {
				// If no, add movie to list and trigger update (which will in turn trigger table refresh)
				movieList.push(movieID);
				movieData[movieID] = {};
				fields.forEach(function(field) {
					movieData[movieID][field.name] = {};
				});
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
					movieList=[];
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
			var i=0;
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
	var fields = [
		{name: "title", CISIname: "title"},
		{name: "releaseYear", CISIname: "year"}
	];
	var numSearchResultButtons = 1;
	// Private functions
	// Produce HTML for table cell from title/year data
	var formatTitleYearSearchResult = function(titleYearSearchResult) {
		var cellHTML = "<td>";
		cellHTML += titleYearSearchResult.value;
		cellHTML += "</td>";
		return(cellHTML);
	};
	// Refresh search results table on page
	var drawSearchResultsTable = function() {
		var rowHTML = "";
		// Clear search results table on page
		$('#searchResultsTableBody').empty();
		// Check if search results data is empty
		if(searchResultsList.length===0) {
			// If yes, display placeholder in table
			rowHTML = "<tr>";
			rowHTML += "<td colspan='";
			rowHTML += fields.length + numSearchResultButtons;
			rowHTML +="'><em>No search results in list</em></td>";
			rowHTML += "</tr>";
			$('#searchResultsTableBody').append(rowHTML);		
		}
		// If no, copy data into table
		else {
			searchResultsList.forEach(function(movieID) {
				rowHTML = "<tr>";
				fields.forEach(function(field) {
					rowHTML += formatTitleYearSearchResult(searchResultsData[movieID][field.name]);
				});
				rowHTML += "<td><button type='button' class='btn btn-default addButton' data-movieid='";
				rowHTML += movieID;
				rowHTML += "'><span class='glyphicon  glyphicon-plus'></span></button></td>";
				rowHTML += "</tr>";
				$('#searchResultsTableBody').append(rowHTML);
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
							searchResultsData[movieID] = {};
							fields.forEach(function(field) {
								searchResultsData[movieID][field.name] = {
									value: searchResult[field.CISIname] || "NA"
								};
							});
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
			var i=0;
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






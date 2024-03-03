$(document).ready(function() {
    // Function to fetch movie recommendations and plot information
    function fetchMovieRecommendations(movieTitle) {
        $.ajax({
            type: 'POST',
            url: '/recommendations', // Ensure this endpoint also provides plot data
            contentType: 'application/json',
            data: JSON.stringify({ 'movie_title': movieTitle }),
            success: function(recommendations) {
                console.log('Recommendations response:', recommendations); // Log the response object
                if (recommendations.message) {
                    $('#movieGrid').html('<div class="message-wrapper"><p>' + recommendations.message + '</p></div>');
                }
                
                else {
                    let gridHtml = '';
                    recommendations.forEach(function(movie) {
                        let initCapTitle = initCap(movie.Title);
                        // Assuming the plot is part of the returned movie object
                        let plot = movie.Plot_Story || "Plot not available"; // Fallback text if no plot is provided
                        gridHtml += `
                            <div class="movie">
                                <img src="${movie.Poster_Link}" alt="${initCapTitle}" title="${plot}">
                                <h3>${initCapTitle}</h3>
                            </div>
                        `;
                    });
                    $('#movieGrid').html(gridHtml);
                }
            }
        });
    }

    // Function to apply initCap to a string
    function initCap(str) {
        return str.toLowerCase().replace(/(?:^|\s)\w/g, function(match) {
            return match.toUpperCase();
        });
    }

    // Event listener for search input changes
    $('#searchInput').on('input', function() {
        let partialTitle = $(this).val();
        if (partialTitle.length > 2) {
            fetchMovieSuggestions(partialTitle);
        } else {
            $('#suggestions').hide();
        }
    });

    // Event listener for suggestion clicks
    $(document).on('click', '.suggestions div', function() {
        let movieTitle = $(this).text();
        $('#searchInput').val(movieTitle);
        $('#suggestions').hide();
        fetchMovieRecommendations(movieTitle);
    });

    // Event listener for search button click
    $('#searchButton').click(function() {
        let movieTitle = $('#searchInput').val();
        fetchMovieRecommendations(movieTitle);
    });

    // Function to fetch movie suggestions
    function fetchMovieSuggestions(partialTitle) {
        $.ajax({
            type: 'POST',
            url: '/suggestions',
            contentType: 'application/json',
            data: JSON.stringify({ 'partial_title': partialTitle }),
            success: function(response) {
                let suggestions = response.suggestions.slice(0, 5); // Limit to 5 suggestions
                let suggestionsHtml = '';
                suggestions.forEach(function(suggestion) {
                    let initCapSuggestion = initCap(suggestion);
                    suggestionsHtml += `<div>${initCapSuggestion}</div>`;
                });
                $('#suggestions').html(suggestionsHtml).show();
            }
        });
    }
});
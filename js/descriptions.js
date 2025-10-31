function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	//TODO: Filter to just the written tweets
	tweets = runkeeper_tweets.map(function(tweet) {
        return new Tweet(tweet.text, tweet.created_at);
    });

	const userWrittenTweets = [];
	tweets.forEach(tweet => {
		if (tweet.written){
			userWrittenTweets.push(tweet);
		}
	});
    window.userWrittenTweets = userWrittenTweets; // Global variable
}

function addEventHandlerForSearch() {
	//TODO: Search the written tweets as text is entered into the search box, and add them to the table
	// Get search query elements
    const textFilter = document.getElementById("textFilter");
    const searchCount = document.getElementById("searchCount");
    const searchText = document.getElementById("searchText");

    // Respond to dynamic typing in search box
    textFilter.addEventListener('input', function () {
        const searchQuery = textFilter.value.toLowerCase();
        searchText.textContent = searchQuery;
		if (searchQuery === '') {
            searchCount.textContent = '0';
            updateResults([]);
        } else {
            const resultTweets = window.userWrittenTweets.filter(tweet => tweet.writtenText.toLowerCase().includes(searchQuery));
			searchCount.textContent = resultTweets.length;
            updateResults(resultTweets);
        }
	});
}

function updateResults(resultTweets) {
    const table = document.getElementById("tweetTable");
    table.innerHTML = '';
    // Add row
    resultTweets.forEach((tweet, index) => {
        
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${tweet.activityType}</td>
            <td>${tweet.writtenText}</td>
        `;
        table.appendChild(row);
        
    });
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	addEventHandlerForSearch();
	loadSavedRunkeeperTweets().then(parseTweets);
});
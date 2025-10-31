function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});
	
	//This line modifies the DOM, searching for the tag with the numberTweets ID and updating the text.
	//It works correctly, your task is to update the text of the other tags in the HTML file!
	document.getElementById('numberTweets').innerText = tweet_array.length;	

	
	// Tweet Dates
	const dates = tweet_array.map(tweet => tweet.time);
	const earliestTweetDate = new Date(Math.min(...dates));
	const latestTweetDate = new Date(Math.max(...dates));
	
	const dateFormat = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
	document.getElementById('firstDate').innerText = earliestTweetDate.toLocaleDateString(undefined, dateFormat);
	document.getElementById('lastDate').innerText = latestTweetDate.toLocaleDateString(undefined, dateFormat);
  



}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});
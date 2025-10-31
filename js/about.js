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

	// TWEET DATES
	const tweetDates = tweet_array.map(tweet => tweet.time);
	const earliestTweetDate = new Date(Math.min(...tweetDates));
	const latestTweetDate = new Date(Math.max(...tweetDates));
	
	// Update HMTL page with dates
	const dateFormat = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
	document.getElementById('firstDate').innerText = earliestTweetDate.toLocaleDateString(undefined, dateFormat);
	document.getElementById('lastDate').innerText = latestTweetDate.toLocaleDateString(undefined, dateFormat);
  
	// TWEET CATEGORIES
	let completedTweets = 0;
	let liveTweets = 0;
	let achievementTweets = 0;
	let miscellaneousTweets = 0;
	let userWrittenTweets = 0;
	
	// Categorize all tweets
	tweet_array.forEach(tweet => {
		switch (tweet.source) {
		  case "completedTweet":
			completedTweets++;
			if (tweet.written) {
				userWrittenTweets++;
			}
			break;
		  case "liveTweet":
			liveTweets++;
			break;
		  case "achievementTweet":
			achievementTweets++;
			break;
		  default:
			miscellaneousTweets++;
		}
	  });

	
	// Update HTML page with numbers and percentages
	const formatPct = (count) => math.format((count / tweet_array.length) * 100, { notation: 'fixed', precision: 2 });
	const writtenFormatPct = (count) => math.format((count / completedTweets) * 100, { notation: 'fixed', precision: 2 });

	
	document.querySelectorAll('.completedEvents').forEach(element => {
		element.innerText = completedTweets;
	});

	document.querySelector('.completedEventsPct').innerText = `${formatPct(completedTweets)}%`;

	document.querySelector('.liveEvents').innerText = liveTweets;
	document.querySelector('.liveEventsPct').innerText = `${formatPct(liveTweets)}%`;

	document.querySelector('.achievements').innerText = achievementTweets;
	document.querySelector('.achievementsPct').innerText = `${formatPct(achievementTweets)}%`;

	document.querySelector('.miscellaneous').innerText = miscellaneousTweets;
	document.querySelector('.miscellaneousPct').innerText = `${formatPct(miscellaneousTweets)}%`;
	
	document.querySelector('.written').innerText = userWrittenTweets;
	document.querySelector('.writtenPct').innerText = `${writtenFormatPct(userWrittenTweets)}%`;


}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});
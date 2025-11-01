
// Calculate Averages
function average(arr) {
    if (arr.length === 0) return 0;
    const sum = arr.reduce((acc, val) => acc + val, 0);
    return sum / arr.length;
}

function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}
	
	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	//TODO: create a new array or manipulate tweet_array to create a graph of the number of tweets containing each type of activity.

	// Collect data for graphing
	const counts = {};
	const distances = {};
    const days = {};

	tweet_array.forEach(tweet => {
        const activity = tweet.activityType;
		const distance = tweet.distance;
		const dayOfWeek = tweet.time.getDay();

		// Count activity type
        if (activity !== "unknown") {
            counts[activity] = (counts[activity] || 0) + 1;
        }

		// Record distance for the activity
		if(distance > 0){
            if (!distances[activity]) {
                distances[activity] = [];
            }
            distances[activity].push(distance);
		}

		// Set up weekday and weekend distance storage and assign distances
		if (!days[activity]) {
			days[activity] = { weekdays: [], weekends: [] };
		}
		if (dayOfWeek >= 1 && dayOfWeek <= 5) {
			days[activity].weekdays.push(distance); // Weekdays 1 - 5
		} else {
			days[activity].weekends.push(distance); // Weekends: 0, 6
		}
    });

	document.getElementById('numberActivities').innerText = Object.keys(counts).length;
	document.getElementById('numberActivities').innerText = Object.keys(counts).length;	
	
	// Find top 3 ranked activities and update DOM
	const sortedCounts = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0,3);
	const topActivities = sortedCounts.map(entry => entry[0]);
	document.getElementById('firstMost').innerText = topActivities[0];
	document.getElementById('secondMost').innerText = topActivities[1];
	document.getElementById('thirdMost').innerText = topActivities[2];

	// Find longest, shortest activities, and min and max distances
	let longest = '';
	let shortest = '';

	let maxDistance = 0;
	let minDistance = Infinity;

	topActivities.forEach(activity => {
        const distance = distances[activity];
        const maxActivityDistance = Math.max(...distance);
        const minActivityDistance = Math.min(...distance);

        if (maxActivityDistance > maxDistance) {
            maxDistance = maxActivityDistance;
            longest = activity;
        }

        if (minActivityDistance < minDistance) {
            minDistance = minActivityDistance;
            shortest = activity;
        }
    });

	// Update DOM
    document.getElementById('longestActivityType').innerText = longest;
    document.getElementById('shortestActivityType').innerText = shortest;

	// Find longest activity for weekdays and weekends
    const longestdistances = days[longest];
    const longestActivityAvgWeekday = average(longestdistances.weekdays);
    const longestActivityAvgWeekend = average(longestdistances.weekends);
    const weekdayOrWeekendLonger = longestActivityAvgWeekday > longestActivityAvgWeekend ? 'weekdays' : 'weekends';

    // Update DOM
    document.getElementById('weekdayOrWeekendLonger').innerText = weekdayOrWeekendLonger;

	// Change data structure for Vega Lite visualization
	const activityData = Object.keys(counts).map(activity => {
        return { activityType: activity, count: counts[activity] };
    });
	activity_vis_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "A graph of the number of Tweets containing each type of activity.",
	  "data": {
	    "values": activityData
	  },
	  //TODO: Add mark and encoding
	  "mark": "bar",
        "encoding": {
            "x": { "field": "activityType", "type": "nominal", "title": "Activity Type" },
            "y": { "field": "count", "type": "quantitative", "title": "Tweet Count" },
            "color": { "field": "activityType", "type": "nominal", "legend": { "title": "Activity Type" } }
        }
	};
	vegaEmbed('#activityVis', activity_vis_spec, {actions:false});

	//TODO: create the visualizations which group the three most-tweeted activities by the day of the week.
	//Use those visualizations to answer the questions about which activities tended to be longest and when.
	
	// Find top 3 distances
	const topActivitiesDistances = [];
	tweet_array.forEach(tweet => {
		const activity = tweet.activityType;
		const distance = tweet.distance;
		const dayOfWeek = tweet.time.getDay();
		
		// Only valid distances
		if (topActivities.includes(activity) && distance > 0) {
			topActivitiesDistances.push({ 
				activityType: activity, 
				distance: distance, 
				dayOfWeek: dayOfWeek
			});
		}
	});

	console.log(topActivitiesDistances);

	// Create Vega-Lite visualization
	const distances_vis_spec = {
	"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	"description": "Distances by Day of Week for Top 3 Activities",
	"data": {
		"values": topActivitiesDistances
	},
	"mark": "point",
	"encoding": {
		"x": {
		"field": "dayOfWeek",
		"type": "ordinal",
		"title": "Day of Week",
		"axis": {
			"labelExpr": "['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][datum.value]" // Show days as names
		}
		},
		"y": {
		"field": "distance",
		"type": "quantitative",
		"title": "Distance",
		"scale":{
			"domain":[0,250]
		},
		"axis":{
			"values": [0, 50, 100, 150, 200],
			"tickCount": 5
		}
		},
		"color": {
		"field": "activityType",
		"type": "nominal",
		"legend": { "title": "Activity Type" }
		}
	}
	};
	vegaEmbed('#distanceVis', distances_vis_spec, {actions:false});


	const aggregatedData = {};

	// Group the distances by activityType and dayOfWeek
	topActivitiesDistances.forEach(tweet => {
		const { activityType, distance, dayOfWeek } = tweet;
		
		if (!aggregatedData[activityType]) {
			aggregatedData[activityType] = {};
		}

		if (!aggregatedData[activityType][dayOfWeek]) {
			aggregatedData[activityType][dayOfWeek] = [];
		}

		// Push the distance into the array for the corresponding activity and day
		aggregatedData[activityType][dayOfWeek].push(distance);
	});

	// Calculate the mean distance for each activityType and dayOfWeek
	const meanDistances = [];

	Object.keys(aggregatedData).forEach(activityType => {
		Object.keys(aggregatedData[activityType]).forEach(dayOfWeek => {
			const distances = aggregatedData[activityType][dayOfWeek];
			const meanDistance = distances.reduce((sum, dist) => sum + dist, 0) / distances.length;

			meanDistances.push({
				activityType: activityType,
				dayOfWeek: dayOfWeek,
				meanDistance: meanDistance
			});
		});
	});

	// Step 2: Update the Vega-Lite visualization to plot the mean distances
	const aggregated_vis_spec = {
		"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
		"description": "Distances by Day of Week for Top 3 Activities (Aggregated by Mean)",
		"data": {
			"values": meanDistances
		},
		"mark": "point",
		"encoding": {
			"x": {
				"field": "dayOfWeek",
				"type": "ordinal",
				"title": "Day of Week",
				"axis": {
					"labelExpr": "['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][datum.value]" // Show days as names
				}
			},
			"y": {
				"field": "meanDistance",
				"type": "quantitative",
				"title": "Mean Distance",
				

			},
			"color": {
				"field": "activityType",
				"type": "nominal",
				"legend": {
					"title": "Activity Type"
				}
			}
		}
	};
	vegaEmbed('#distanceVisAggregated', aggregated_vis_spec, {actions:false});


}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);

	const distanceVis = document.getElementById("distanceVis");
    const distanceVisAggregated = document.getElementById("distanceVisAggregated");
	const aggregateButton = document.getElementById("aggregate");
	distanceVisAggregated.style.display = "none"; // Hide distanceVisAggregated
	distanceVis.style.width = "200%";
	distanceVisAggregated.style.width = "200%";
});

// Toggle between graphs
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("aggregate").addEventListener("click", function() {
        const distanceVis = document.getElementById("distanceVis");
        const distanceVisAggregated = document.getElementById("distanceVisAggregated");
		const aggregateButton = document.getElementById("aggregate");

        // Toggle visibility
        if (distanceVis.style.display === "none") {
            distanceVis.style.display = "block"; // Show
            distanceVisAggregated.style.display = "none"; // Hide
			aggregateButton.textContent = "Show means";
        } else {
            distanceVis.style.display = "none"; // Hide 
            distanceVisAggregated.style.display = "block"; // Show 
			aggregateButton.textContent = "Show all activities";
        }
    });

});
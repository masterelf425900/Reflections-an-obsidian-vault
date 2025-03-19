const notice = msg => new Notice(msg, 5000);
const log = msg => console.log(msg);
const API_KEY_OPTION = "OMDb API Key";
const API_URL = "https://www.omdbapi.com/";

module.exports = {
    entry: start,
    settings: {
        name: "TV Show Script",
        author: "Christian B. B. Houmann",
        options: {
            [API_KEY_OPTION]: {
                type: "text",
                defaultValue: "",
                placeholder: "OMDb API Key",
            },
        }
    }
};

let QuickAdd;
let Settings;

function getAiringStatus(confirmedSeasons, airedSeasons, releaseDates = {}, cancellations = {}) {
    const airingStatus = [];
    const currentDate = new Date();
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(currentDate.getMonth() + 6);

    for (let i = 1; i <= confirmedSeasons; i++) {
        if (i <= airedSeasons) {
            // Aired seasons
            airingStatus.push(`  - "Finished"`);
        } else if (cancellations[i]) {
            // Explicitly canceled seasons
            airingStatus.push(`  - "Cancelled"`);
        } else if (releaseDates[i]) {
            // Seasons with known release dates
            const releaseDate = new Date(releaseDates[i]);
            if (releaseDate <= sixMonthsFromNow) {
                airingStatus.push(`  - "Upcoming"`);
            } else {
                airingStatus.push(`  - "Renewed"`);
            }
        } else {
            // Unknown or announced seasons without dates
            airingStatus.push(`  - "Renewed"`);
        }
    }
    return airingStatus;
}

async function start(params, settings) {
    QuickAdd = params;
    Settings = settings;
    const query = await QuickAdd.quickAddApi.inputPrompt("Enter TV show title or IMDB ID: ");
    if (!query) {
        notice("No query entered.");
        throw new Error("No query entered.");
    }

    let selectedShow;
    if (isImdbId(query)) {
        selectedShow = await getByImdbId(query);
    } else {
        const results = await getByQuery(query);
        const tvResults = results.filter(result => result.Type === "series");
        if (tvResults.length === 0) {
            notice("No TV shows found.");
            throw new Error("No TV shows found.");
        }
        const choice = await QuickAdd.quickAddApi.suggester(tvResults.map(formatTitleForSuggestion), tvResults);
        if (!choice) {
            notice("No choice selected.");
            throw new Error("No choice selected.");
        }
        selectedShow = await getByImdbId(choice.imdbID);
    }

    const yearRange = selectedShow.Year.split("–");
    const currentYear = new Date().getFullYear();
    const isOngoing = !yearRange[1] || parseInt(yearRange[1]) >= currentYear;

    // Handle single-season shows by defaulting to 1 if totalSeasons is undefined or "N/A"
    const confirmedSeasons = selectedShow.totalSeasons && selectedShow.totalSeasons !== "N/A" 
        ? parseInt(selectedShow.totalSeasons) 
        : 1;
        
    const airedSeasons = isOngoing ? confirmedSeasons - 1 : confirmedSeasons;

    // Ensure at least one season for ratings and watched status
    const effectiveSeasons = Math.max(1, airedSeasons);

    // Example: Replace this with actual release date and cancellation data if available
    const releaseDates = {
        3: "2024-04-15", // Season 3 announced release date
        4: null // No release date for Season 4
    };
    const cancellations = {
        5: false // No explicit cancellation for Season 5
    };

    const seasonNumbers = Array.from({ length: confirmedSeasons }, (_, i) => `  - "${i + 1}"`);
    const ratingNumbers = Array.from({ length: effectiveSeasons }, () => `  - "unrated.webp"`);
    const watchedStatus = Array.from({ length: effectiveSeasons }, () => `  - "Watched"`);
    const airingArray = getAiringStatus(confirmedSeasons, airedSeasons, releaseDates, cancellations);

    // Replace the 'date' field with 'Unknown' values for each season
    const watchDates = Array.from({ length: confirmedSeasons }, () => `  - "Unknown"`);

    QuickAdd.variables = {
        ...selectedShow,
        actorLinks: linkifyList(selectedShow.Actors.split(",")),
        genreLinks: linkifyList(selectedShow.Genre.split(",")),
        directorLink: linkifyList(selectedShow.Director.split(",")),
        fileName: replaceIllegalFileNameCharactersInString(selectedShow.Title),
        typeLink: "[[Series]]",
        languageLower: selectedShow.Language.toLowerCase(),
        seasons: seasonNumbers.join("\n"),
        ratings: ratingNumbers.join("\n"),
        watchedArray: watchedStatus.join("\n"),
        airingArray: airingArray.join("\n"),
        watchdate: watchDates.join("\n")  // Add the watchdates field
    };
}

function isImdbId(str) {
    return /^tt\d+$/.test(str);
}

function formatTitleForSuggestion(resultItem) {
    return `${resultItem.Title} (${resultItem.Year})`;
}

async function getByQuery(query) {
    const searchResults = await apiGet(API_URL, {
        "s": query,
        "type": "series"
    });

    if (!searchResults.Search || !searchResults.Search.length) {
        notice("No results found.");
        throw new Error("No results found.");
    }
    return searchResults.Search;
}

async function getByImdbId(id) {
    const res = await apiGet(API_URL, {
        "i": id,
        "type": "series"
    });

    if (!res || res.Type !== "series") {
        notice("No TV show found with this ID.");
        throw new Error("No TV show found with this ID.");
    }
    return res;
}

function linkifyList(list) {
    if (list.length === 0) return "";
    if (list.length === 1) return `\n  - "[[${list[0]}]]"`;
    return list.map(item => `\n  - "[[${item.trim()}]]"`).join("");
}

function replaceIllegalFileNameCharactersInString(string) {
    return string.replace(/[\\,#%&\{\}\/*<>$\'\":@]*/g, '');    
}

async function apiGet(url, data) {
    let finalURL = new URL(url);
    if (data)
        Object.keys(data).forEach(key => finalURL.searchParams.append(key, data[key]));
    finalURL.searchParams.append("apikey", Settings[API_KEY_OPTION]);
    const res = await request({
        url: finalURL.href,
        method: 'GET',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return JSON.parse(res);
}

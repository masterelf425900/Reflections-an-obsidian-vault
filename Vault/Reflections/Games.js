const notice = msg => new Notice(msg, 5000);
const log = msg => console.log(msg);
const API_KEY_OPTION = "RAWG API Key";
const API_URL = "https://api.rawg.io/api/games";

module.exports = {
    entry: start,
    settings: {
        name: "Game Script",
        author: "Your Name",
        options: {
            [API_KEY_OPTION]: {
                type: "text",
                defaultValue: "",
                placeholder: "RAWG API Key",
            },
        }
    }
}

let QuickAdd;
let Settings;

async function start(params, settings) {
    QuickAdd = params;
    Settings = settings;
    const query = await QuickAdd.quickAddApi.inputPrompt("Enter game title or RAWG ID: ");
    if (!query) {
        notice("No query entered.");
        throw new Error("No query entered.");
    }
    let selectedGame;
    if (isRawgId(query)) {
        selectedGame = await getByRawgId(query);
    } else {
        const results = await getByQuery(query);
        const choice = await QuickAdd.quickAddApi.suggester(results.map(formatTitleForSuggestion), results);
        if (!choice) {
            notice("No choice selected.");
            throw new Error("No choice selected.");
        }
        selectedGame = await getByRawgId(choice.id);
    }
    
    // Remove colons from name
    const formattedName = selectedGame.name.replace(/:/g, '');

    // Fetch DLC separately
    const dlcResults = await fetchDLC(selectedGame);

    QuickAdd.variables = {
        name: formattedName,
        id: selectedGame.id,
        cover: `${formattedName}.jpg`, // Update cover value
        genre: selectedGame.genres ? selectedGame.genres.map(genre => genre.name).join(', ') : '',
        developer: selectedGame.developers ? selectedGame.developers.map(dev => dev.name).join(', ') : '',
        publisher: selectedGame.publishers ? selectedGame.publishers.map(pub => pub.name).join(', ') : '',
        release_date: selectedGame.released,
        platform: selectedGame.platforms ? selectedGame.platforms.map(platform => platform.platform.name).join(', ') : '',
        
        // Updated DLC handling
        dlc: dlcResults.length ? dlcResults.map(dlc => dlc.name).join(', ') : '',
        
        rating: 'Strong.webp',
        status: 'Played',
        date: 'Unknown',
        
        genreLinks: linkifyList(selectedGame.genres?.map(genre => genre.name) || []),
        developerLinks: linkifyList(selectedGame.developers?.map(dev => dev.name) || []),
        publisherLinks: linkifyList(selectedGame.publishers?.map(pub => pub.name) || []),
        platformLinks: linkifyList(selectedGame.platforms?.map(platform => platform.platform.name) || []),
        dlcLinks: dlcResults.length ? linkifyList(dlcResults.map(dlc => dlc.name)) : "None",
        fileName: replaceIllegalFileNameCharactersInString(formattedName),
    }
}

// New function to fetch DLC and strip the main game's name
async function fetchDLC(selectedGame) {
    try {
        const dlcResults = await apiGet(`${API_URL}/${selectedGame.id}/additions`);
        const mainGameName = selectedGame.name;

        // Remove the main game's name from DLC titles and replace colons with spaces
        const formattedDlcResults = dlcResults.results 
            ? dlcResults.results.map(dlc => ({
                ...dlc, 
                name: dlc.name
                    .replace(new RegExp(`^${mainGameName}\\s*[-–:]?\\s*`, 'i'), '') // Remove "Game Name" and optional separator
                    .replace(/:/g, ' ') // Replace colons with spaces
            })) 
            : [];

        return formattedDlcResults;
    } catch (error) {
        console.error("Error fetching DLC:", error);
        return [];
    }
}

function isRawgId(str) {
    return /^\d+$/.test(str);
}

function formatTitleForSuggestion(resultItem) {
    return `${resultItem.name} (${resultItem.released || "Unknown Release Date"})`;
}

async function getByQuery(query) {
    const searchResults = await apiGet(`${API_URL}?search=${encodeURIComponent(query)}`);
    if (!searchResults.results || !searchResults.results.length) {
        notice("No results found.");
        throw new Error("No results found.");
    }
    return searchResults.results;
}

async function getByRawgId(id) {
    const res = await apiGet(`${API_URL}/${id}`);
    if (!res) {
        notice("No results found.");
        throw new Error("No results found.");
    }
    return res;
}

function linkifyList(list) {
    if (list.length === 0) return "None";
    if (list.length === 1) return `\n  - "[[${list[0]}]]"`;
    return list.map(item => `\n  - "[[${item.trim()}]]"`).join("");
}

function replaceIllegalFileNameCharactersInString(string) {
    return string.replace(/[\\,#%&\{\}\/*<>$\'\":@]*/g, '');    
}

async function apiGet(url) {
    const finalURL = new URL(url);
    finalURL.searchParams.append("key", Settings[API_KEY_OPTION]);
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

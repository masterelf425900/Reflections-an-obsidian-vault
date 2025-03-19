---
cssclasses:
  - table-daily
obsidianUIMode: preview
Sort:
  - Hollow Knight
  - Sekiro Shadows Die Twice
  - Road Rash
  - Sunset Riders
  - Rise of Nations Rise of Legends
  - Shadow Tactics Blades of the Shogun
  - Warcraft III The Frozen Throne
  - 
  - Clash of Clans
Rating: Rating
Status: Status
Year: Year
Month: Month
Genre: Genre
Collection: Collection
Platform: Platform
DLC: DLC

---

`INPUT[inlineSelect(class(movies), option(Collection), option(AAA), option(Boutique), option(Mobile), option(Retro), option(Strategy)):Collection]`  `INPUT[inlineSelect(class(movies), option(DLC), option(Available), option(Unavailable)):DLC]`  `INPUT[inlineSelect(class(games), option(Platform), option(Android), option(Classic Macintosh), option(Dreamcast), option(Game Boy Advance), option(GameCube), option(Genesis), option(iOS), option(Linux), option(macOS), option(NES), option(Neo Geo), option(Nintendo 3DS), option(Nintendo DS), option(Nintendo Switch), option(PC), option(PlayStation), option(PlayStation 2), option(PlayStation 3), option(PlayStation 4), option(PlayStation 5), option(PSP), option(PS Vita), option(SNES), option(Steam Deck), option(VR), option(Wii), option(Wii U), option(Xbox), option(Xbox 360), option(Xbox One), option(Xbox Series S/X)):Platform]`  `INPUT[inlineSelect(class(games), option(Genre), option(Action), option(Adventure), option(Arcade), option(Asymmetric Multiplayer), option(Battle Royale), option(Boomer Shooter), option(Bullet Hell), option(CRPG), option(Casual), option(City Builder), option(Crafting), option(Deckbuilding), option(Family), option(Fighting), option(Gambling), option(Gig Economy), option(Hack and Slash), option(Horror), option(Indie), option(MMO), option(MOBA), option(Music Rhythm), option(Open-World), option(Party Game), option(Platformer), option(Puzzle), option(Racing), option(Roguelike), option(Roguelite), option(Sandbox), option(Shooter), option(Simulation), option(Soulslike), option(Sports), option(Stealth), option(Strategy), option(Survival), option(Text Adventure), option(Tower Defense), option(Visual Novel), option(Wargame), option(Witchcraft), option(Zombie)):Genre]`   `INPUT[inlineSelect(class(movies), option(Status), option(Watched),option(Unwatched), option(Watchlist)):Status]`   `INPUT[inlineSelect(class(movies), option(Year), option(2025)):Year]`   `INPUT[inlineSelect(class(movies), option(Month), option(January), option(February), option(March), option(April), option(May), option(June), option(July), option(August), option(September), option(October), option(November), option(December)):Month]`   `INPUT[inlineSelect(class(movies), option(Rating),option(Mighty), option(Strong),option(Fair), option(Weak)):Rating]`   `BUTTON[Refresh]`

```meta-bind-embed
[[Movies Embeds]]
```

```dataviewjs
// Get all notes from the 'Games' folder and with the tag 'games'
let games = dv.pages('"04-Entertainment/Games"').where(p => p.tags && p.tags.includes('games'));

// Get all game names
let allGameNames = games.map(g => g.file.name);

// Get the current sorting order and filters from frontmatter
let currentSort = dv.current().Sort || [];
let currentRating = dv.current().Rating;
let currentStatus = dv.current().Status;
let currentGenre = dv.current().Genre;
let currentYear = dv.current().Year;
let currentMonth = dv.current().Month;
let currentPlatform = dv.current().Platform;
let currentDLC = dv.current().DLC;
let currentCollection = dv.current().Collection;

// Get the update method from MetaEdit
const { update } = app.plugins.plugins["metaedit"].api;

// Initialize Sort field if it doesn't exist or is empty
if (!currentSort || currentSort.length === 0) {
    currentSort = allGameNames;
    update('Sort', currentSort, dv.current().file.path);
}

// Ensure currentSort is an array
if (!Array.isArray(currentSort)) {
    currentSort = [];
}

// Filter out any games in currentSort that no longer exist
currentSort = currentSort.filter(name => allGameNames.includes(name));

// Add any games that aren't in the sort order yet
let missingGames = allGameNames.filter(name => !currentSort.includes(name));
if (missingGames.length > 0) {
    currentSort = [...currentSort, ...missingGames];
    update('Sort', currentSort, dv.current().file.path);
}

// Filter by DLC availability
if (currentDLC && currentDLC !== 'DLC') {
    games = games.filter(game => {
        const hasDLC = game.dlc != null && game.dlc !== '';
        
        if (currentDLC === 'Available') {
            return hasDLC;
        } else if (currentDLC === 'Unavailable') {
            return !hasDLC;
        }
        
        return true; // If DLC is set to "DLC", include all entries
    });
}

// Filter by Platform 
if (currentPlatform && currentPlatform !== 'Platform') {
    games = games.filter(game => {
        const gamePlatform = game.platform?.split(',').map(g => g.trim()) || 
                          game.Platform?.split(',').map(g => g.trim()) || [];
        return gamePlatform.includes(currentPlatform);
    });
}

// Apply Collection filter if specified and not "Collection"
if (currentCollection && currentCollection !== 'Collection') {
    games = games.filter(game => {
        const gameTags = game.tags || [];
        return gameTags.includes(currentCollection);
    });
}

// Apply other filters
// Filter by Rating if specified and not "Rating"
if (currentRating && currentRating !== 'Rating') {
    games = games.filter(game => {
        const gameRating = game.rating?.replace('.webp', '');
        return gameRating === currentRating;
    });
}

// Filter by Status if specified and not "Status"
if (currentStatus && currentStatus !== 'Status') {
    games = games.filter(game => {
        return game.status === currentStatus;
    });
}

// Filter by Genre if specified and not "Genre"
if (currentGenre && currentGenre !== 'Genre') {
    games = games.filter(game => {
        const gameGenres = game.genre?.split(',').map(g => g.trim()) || 
                          game.Genre?.split(',').map(g => g.trim()) || [];
        return gameGenres.includes(currentGenre);
    });
}

// Filter by Year and Month if specified and not their field names
if ((currentYear && currentYear !== 'Year') || (currentMonth && currentMonth !== 'Month')) {
    games = games.filter(game => {
        if (!game.date) return false;
        
        const dateParts = game.date.split(' ');
        const gameYear = dateParts[0];
        const gameMonth = dateParts[1];
        
        const yearMatch = currentYear === 'Year' || gameYear === currentYear.toString();
        const monthMatch = currentMonth === 'Month' || 
                         gameMonth === currentMonth.substring(0, 3);
        
        return yearMatch && monthMatch;
    });
}

// Sort games based on the YAML-defined order without refresh
games = games.sort(g => currentSort.indexOf(g.file.name));

// [Rest of the previous script remains the same, including keywordColors, applyKeywordColor, formatList, etc.]

// Define color codes for specific keywords
const keywordColors = {
    // Status Colors
    "Unknown": "rgb(100, 90, 155)",      // Purple
    "Played": "rgb(26, 188, 156)",        // Lime Green
    "Unplayed": "rgb(220, 86, 151)",      // Tomato Red
    "Wishlist": "rgb(171, 191, 226)",     // Gold
    "In Progress": "rgb(255, 165, 0)",    // Orange
    "Dormant": "rgb(212, 186, 143)",      // Orange
    
    // Game Genres - Video Game Categories
    "Action": "rgb(225, 110, 95)",        // Softened Tomato Red
    "Adventure": "rgb(225, 150, 70)",     // Softened Dark Orange
    "RPG": "rgb(225, 170, 180)",          // Softened Light Pink
    "Strategy": "rgb(157, 130, 205)",     // Softened Medium Purple
    "Shooter": "rgb(205, 70, 90)",        // Softened Crimson
    "Simulation": "rgb(76, 165, 120)",    // Softened Sea Green
    "Sports": "rgb(90, 150, 195)",        // Softened Steel Blue
    "Fighting": "rgb(225, 190, 60)",      // Softened Gold
    "Horror": "rgb(160, 60, 60)",         // Softened Maroon
    "Platformer": "rgb(200, 130, 195)",   // Softened Orchid
    "MMO": "rgb(100, 90, 155)",           // Softened Dark Slate Blue
    "Survival": "rgb(170, 90, 190)",      // Softened Dark Orchid
    "Open World": "rgb(80, 100, 100)",    // Softened Dark Slate Gray
    "Stealth": "rgb(190, 145, 100)",      // Softened Peru Brown
    "Puzzle": "rgb(185, 70, 70)",         // Softened Firebrick
    "Racing": "rgb(225, 140, 100)",       // Softened Coral
    "Music": "rgb(65, 65, 165)",          // Softened Midnight Blue
    "Indie": "rgb(190, 120, 70)",         // Softened Chocolate
    "Arcade": "rgb(168, 64, 103)",        // Softened Crimson
    "Casual": "rgb(134, 134, 176)",       // Concrete Grey
    "Family": "rgb(214, 207, 161)",       // Bright Beige
    "MOBA": "rgb(116, 136, 51)",          // Olive Green
    
    // Platforms (existing)
    "PC": "rgb(171, 191, 216)",           // Ice Blue for PC
    "macOS": "rgb(157, 130, 205)",         // Light Gray for macOS
    "Classic Macintosh": "rgb(198, 195, 164)", // Light Gray for macOS
    "Linux": "rgb(225, 150, 70)",          // Darker Gray for Linux
    "Steam Deck": "rgb(0, 180, 100)",      // Softer Steam Deck Green
    "Nintendo Switch": "rgb(205, 70, 90)", // Lighter Nintendo Red
    "Nintendo 3DS": "rgb(45, 180, 250)",   // Softer Blue for Nintendo 3DS
    "Nintendo DS": "rgb(60, 180, 230)",    // Softer DS Blue
    "NES": "rgb(170, 170, 170)",           // Lighter Classic Gray for NES
    "SNES": "rgb(223, 120, 92)",           // Dark Blue
    "Wii": "rgb(190, 191, 196)",           // Softer Wii White
    "Wii U": "rgb(94, 85, 85)",            // Darker Wii U Black
    "Game Boy Advance": "rgb(82, 100, 163)", // Indigo
    "GameCube": "rgb(102, 87, 170)",       // Purple
    "Dreamcast": "rgb(230, 127, 47)",       // Purple
    "Genesis": "rgb(243, 179, 247)",        // Dark Blue (already defined)
    "Neo Geo": "rgb(192, 156, 88)",         // Yellow
    "PSP": "rgb(30, 93, 150)",              // Dark Blue
    "PS Vita": "rgb(37, 96, 148)",           // Dark Blue
    "PlayStation": "rgb(0, 90, 170)",        // Softer PlayStation Blue
    "PlayStation 2": "rgb(0, 100, 180)",     // Lighter PlayStation Blue (PS2)
    "PlayStation 3": "rgb(0, 140, 225)",     // Softer PlayStation Light Blue
    "PlayStation 4": "rgb(65, 170, 215)",    // Softer PlayStation Light Blue
    "PlayStation 5": "rgb(0, 90, 170)",      // Softer PlayStation Blue
    "Xbox": "rgb(45, 155, 45)",             // Softer Xbox Green
    "Xbox 360": "rgb(0, 160, 0)",            // Softer Xbox 360 Green
    "Xbox One": "rgb(17, 189, 132)",         // Lighter Xbox Green
    "Xbox Series S/X": "rgb(17, 189, 132)",  // Softer Xbox Series Green
    "Android": "rgb(255, 180, 40)",          // Softer Orange for Android
    "iOS": "rgb(132, 92, 204)",              // Softer iOS Orange
    "VR": "rgb(125, 70, 210)",               // Softer Deep Purple for VR

    // New Platforms
    "Game Boy": "rgb(141, 196, 36)",         // Classic Game Boy Green
    "Atari ST": "rgb(230, 126, 34)",         // Bold Orange for Atari ST
    "Game Boy Color": "rgb(102, 204, 0)",      // Vibrant green for Game Boy Color
    "SEGA Master System": "rgb(0, 174, 239)",  // Bright blue for SEGA Master System
    // "Genesis" is already defined above.
    "Game Gear": "rgb(200, 100, 150)",         // Muted purple-pink for Game Gear
    "SEGA CD": "rgb(255, 153, 51)",            // Warm orange for SEGA CD
    "Commodore / Amiga": "rgb(102, 204, 255)",   // Cool cyan for Commodore / Amiga

    // Other UI Elements
    "•": "rgb(102, 102, 102)"                  // Bullet Point Gray
};

// Simple hash function to generate a consistent color
function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
}

// Generate a dynamic color based on DLC count and position
function generateDynamicColor(dlcItem, dlcCount, dlcIndex) {
    // Base palette of muted colors
    const basePalette = [
        "rgb(150, 100, 100)",   // Muted Brick Red
        "rgb(100, 150, 100)",   // Muted Sage Green
        "rgb(100, 100, 150)",   // Muted Navy Blue
        "rgb(150, 100, 150)",   // Muted Lavender
        "rgb(150, 150, 100)",   // Muted Olive
        "rgb(100, 150, 150)",   // Muted Teal
        "rgb(200, 120, 80)",    // Muted Terracotta
        "rgb(120, 80, 200)",    // Muted Purple
        "rgb(80, 200, 120)"     // Muted Emerald
    ];

    // Use a combination of hash and index to select color
    const colorIndex = (hashCode(dlcItem) + dlcIndex) % basePalette.length;
    
    // Optional: Add slight variation based on total DLC count
    const variation = Math.floor((dlcIndex / dlcCount) * 30);
    
    return basePalette[colorIndex];
}

// Enhanced function to apply color to matching keywords
const applyKeywordColor = (text, options = {}) => {
    if (!text) return '';
    let coloredText = text;
    
    const sortedKeywords = Object.keys(keywordColors).sort((a, b) => b.length - a.length);
    
    for (const keyword of sortedKeywords) {
        const color = keywordColors[keyword];
        // Use a regex that matches the keyword before a comma, at the start of the string, or at the end
        const regex = new RegExp(`(^|[,\\s])${keyword}(?=[,\\s]|$)`, 'g');
        coloredText = coloredText.replace(regex, `$1<span style="color: ${color}; font-weight: bold;">${keyword}</span>`);
    }
    
    // If dynamic coloring for DLC is requested
    if (options.dynamicDLC) {
        const { dlcItem, dlcCount, dlcIndex } = options;
        const dynamicColor = generateDynamicColor(dlcItem, dlcCount, dlcIndex);
        coloredText = `<span style="color: ${dynamicColor}; font-weight: bold;">${coloredText}</span>`;
    }
    
    return coloredText;
};

// Function to prepare list items with colored bullets
const formatList = (list, options = {}) => {
    if (!list) return '';
    const dlcItems = list.split(',');
    return dlcItems
        .map((item, index) => {
            const bullet = `<span style="color: ${keywordColors['•']}; font-weight: bold;">•</span>`;
            const trimmedItem = item.trim();
            const coloredItem = applyKeywordColor(trimmedItem, {
                dynamicDLC: options.dynamicDLC,
                dlcItem: trimmedItem,
                dlcCount: dlcItems.length,
                dlcIndex: index
            });
            return `${bullet} <span style="font-weight: bold">${coloredItem}</span>`;
        })
        .join('<br>');
};

// Function to check if a date string contains numbers
const containsNumbers = (str) => /\d/.test(str);

// Updated updateTable function
const updateTable = () => {
    table.length = 0;
    for (let game of games) {
        let container = dv.el("div", "", { 
            attr: { 
                style: "display: flex; flex-direction: column; min-width: 400px;" 
            } 
        });
        
        // Create game title display
        container.appendChild(dv.span(`**${applyKeywordColor('•')} [[${game.file.name}]]**`));
        
        // Add cover if it exists
        if (game.cover) {
            container.appendChild(dv.el("span", "![[" + game.cover + "|400]]", { 
                attr: { style: "margin-top: 15px;" }
            }));
        }
        
        // [DLC, platform, genre formatting stays the same]
        let dlcContent = game.dlc ? formatList(game.dlc, { dynamicDLC: true }) : '';
        let platformContent = game.platform ? formatList(game.platform) : '';
        let genreContent = formatList(game.genre || game.Genre);
        let statusContent = game.status ? applyKeywordColor(`• ${game.status}`) : '';
        let dateContent = '';
        if (game.date) {
            dateContent = containsNumbers(game.date)
                ? applyKeywordColor(`• [[${game.date}]]`)
                : applyKeywordColor(`• ${game.date}`);
        }
        
        // Rating element with fixed width
        let ratingContent = game.rating 
            ? dv.el("span", "![[" + game.rating + "|75]]", { 
                attr: { 
                    style: "margin-top: 0px; width: 75px; display: inline-block;" 
                }
            })
            : '';
        
        table.push([
            container,
            dlcContent ? dv.el("div", dlcContent, { attr: { style: "text-align: left; min-width: 10px;" }, html: true }) : '',
            platformContent ? dv.el("div", platformContent, { attr: { style: "text-align: left; width: 160px;" }, html: true }) : '',
            genreContent ? dv.el("div", genreContent, { attr: { style: "text-align: left; width: 120px;" }, html: true }) : '',
            statusContent ? dv.el("div", statusContent, { attr: { style: "text-align: left; width: 120px;" }, html: true }) : '',
            dateContent ? dv.el("div", dateContent, { attr: { style: "text-align: left; width: 110px;" }, html: true }) : '',
            ratingContent
        ]);
    }

    dv.table(
        ["Game", "DLC", "Platform", "Genre", "Status", "Date", "Rating"],
        table,
        { cls: "games-table" }
    );
};

// Initialize table
let table = [];
updateTable();
```



---
cssclasses:
  - table-daily
obsidianUIMode: preview
Sort:
  - Chernobyl
  - Attack on Titan
  - Game of Thrones
  - Ben 10
  - Danny Phantom
  - Star Wars Rebels
Rating: Rating
Status: Status
Year: Year
Month: Month
Genre: Genre
Collection: Collection

---

`INPUT[inlineSelect(class(movies), option(Collection), option(Live-Action), option(2D-Animation), option(3D-Animation)):Collection]` `INPUT[inlineSelect(class(movies),option(Genre), option(Action), option(Adventure), option(Animation), option(Biography), option(Comedy), option(Crime), option(Cyberpunk), option(Disaster), option(Documentary), option(Drama), option(Family), option(Fantasy), option(Film-Noir), option(History), option(Horror), option(Martial Arts), option(Musical), option(Mystery), option(Post-Apocalyptic), option(Psychological), option(Romance), option(Sci-Fi), option(Sport), option(Spy), option(Superhero), option(Survival), option(Thriller), option(Time Travel), option(War), option(Western), option(Supernatural), option(Short)):Genre]`   `INPUT[inlineSelect(class(movies), option(Status), option(Watched),option(Unwatched), option(Watchlist), option(Dormant), option(In Progress)):Status]`   `INPUT[inlineSelect(class(movies), option(Year), option(2025)):Year]`   `INPUT[inlineSelect(class(movies), option(Month), option(January), option(February), option(March), option(April), option(May), option(June), option(July), option(August), option(September), option(October), option(November), option(December)):Month]`   `INPUT[inlineSelect(class(movies), option(Rating),option(Mighty), option(Strong),option(Fair), option(Weak)):Rating]`   `BUTTON[Refresh]`

```meta-bind-embed
[[Movies Embeds]]
```


```dataviewjs
// Get all shows first
let shows = dv.pages('"04-Entertainment/Tv-Shows"').where(p => p.tags && p.tags.includes('shows'));
let allMovieNames = shows.map(m => m.file.name);

// Get the current sorting order and filters from frontmatter
let currentSort = dv.current().Sort || [];
let currentRating = dv.current().Rating;
let currentStatus = dv.current().Status;
let currentGenre = dv.current().Genre;
let currentYear = dv.current().Year;
let currentMonth = dv.current().Month;
let currentCollection = dv.current().Collection;

// Get the update method from MetaEdit
const { update } = app.plugins.plugins["metaedit"].api;

// Initialize Sort field if it doesn't exist or is empty
if (!currentSort || currentSort.length === 0) {
    currentSort = allMovieNames;
    update('Sort', currentSort, dv.current().file.path);
}

// Ensure currentSort is an array
if (!Array.isArray(currentSort)) {
    currentSort = [];
}

// Filter out any shows in currentSort that no longer exist
currentSort = currentSort.filter(name => allMovieNames.includes(name));

// Add any shows that aren't in the sort order yet
let missingshows = allMovieNames.filter(name => !currentSort.includes(name));
if (missingshows.length > 0) {
    currentSort = [...currentSort, ...missingshows];
    update('Sort', currentSort, dv.current().file.path);
}

// Apply Collection filter if specified and not "Collection"
if (currentCollection && currentCollection !== 'Collection') {
    shows = shows.filter(movie => {
        const movieTags = movie.tags || [];
        return movieTags.includes(currentCollection);
    });
}

// Apply other filters
if (currentRating && currentRating !== 'Rating') {
    shows = shows.filter(movie => movie.rating?.includes(currentRating));
}

if (currentStatus && currentStatus !== 'Status') {
    shows = shows.filter(movie => movie.status?.includes(currentStatus));
}

if (currentGenre && currentGenre !== 'Genre') {
    shows = shows.filter(movie => {
        const genres = (movie.genre || "").split(',').map(g => g.trim());
        return genres.includes(currentGenre);
    });
}

if ((currentYear && currentYear !== 'Year') || (currentMonth && currentMonth !== 'Month')) {
    shows = shows.filter(movie => {
        if (!movie.date) return false;

        const [year, month] = movie.date.split(' ');
        const yearMatch = currentYear === 'Year' || year === currentYear.toString();
        const monthMatch = currentMonth === 'Month' || month?.startsWith(currentMonth.substring(0, 3));
        return yearMatch && monthMatch;
    });
}

// Sort shows based on the YAML-defined order
shows = shows.sort(m => currentSort.indexOf(m.file.name));

// Define keyword colors
const keywordColors = {
    // Status Colors

    "Watched": "rgb(26, 188, 156)",       // Lime Green
    "Unwatched": "rgb(220, 86, 151)",     // Tomato Red
    "Watchlist": "rgb(171, 191, 226)",    // Gold
    "Dormant": "rgb(223, 196, 150)",    // Gold
    "In Progress": "rgb(255, 165, 0)",    // Orange

    "Unknown": "rgb(164, 100, 206)",      // Purple
    "Faded": "rgb(88, 86, 220)",      // Purple

    // Status Colors
    "Finished": "rgb(40, 163, 102)",      // Purple
    "Ongoing": "rgb(199, 50, 122)",       // Lime Green
    "Cancelled": "rgb(163, 46, 40)",    // Gold
    "Upcoming": "rgb(196, 174, 67)",    // Orange
    "Renewed": "rgb(67, 187, 196)",    // Gold

    // Status Colors
    "1": "rgb(88, 86, 220)",      // Purple
    "2": "rgb(88, 86, 220)",      // Purple
    "3": "rgb(88, 86, 220)",      // Purple
    "4": "rgb(88, 86, 220)",      // Purple
    "5": "rgb(88, 86, 220)",      // Purple
    "6": "rgb(88, 86, 220)",      // Purple
    "7": "rgb(88, 86, 220)",      // Purple
    "8": "rgb(88, 86, 220)",      // Purple
    "9": "rgb(88, 86, 220)",      // Purple
    "10": "rgb(88, 86, 220)",      // Purple


    // Genre Colors - Main Categories (Slightly Muted)
    "Action": "rgb(225, 110, 95)",        // Softened Tomato Red
    "Adventure": "rgb(225, 150, 70)",     // Softened Dark Orange
    "Animation": "rgb(225, 170, 180)",    // Softened Light Pink
    "Biography": "rgb(157, 130, 205)",    // Softened Medium Purple
    "Comedy": "rgb(225, 190, 60)",        // Softened Gold
    "Crime": "rgb(205, 70, 90)",          // Softened Crimson
    "Documentary": "rgb(76, 165, 120)",    // Softened Sea Green
    "Drama": "rgb(90, 150, 195)",         // Softened Steel Blue
    "Family": "rgb(225, 170, 180)",       // Softened Pink
    "Fantasy": "rgb(155, 90, 210)",       // Softened Blue Violet
    "Film-Noir": "rgb(80, 100, 100)",     // Softened Dark Slate Gray
    "History": "rgb(190, 145, 100)",      // Softened Peru Brown
    "Horror": "rgb(160, 60, 60)",         // Softened Maroon
    "Musical": "rgb(200, 130, 195)",      // Softened Orchid
    "Mystery": "rgb(100, 90, 155)",       // Softened Dark Slate Blue
    "Romance": "rgb(225, 130, 170)",      // Softened Hot Pink
    "Sci-Fi": "rgb(65, 170, 215)",        // Softened Deep Sky Blue
    "Sport": "rgb(80, 165, 80)",          // Softened Forest Green
    "Thriller": "rgb(170, 90, 190)",      // Softened Dark Orchid
    "War": "rgb(165, 100, 70)",           // Softened Saddle Brown
    "Western": "rgb(180, 145, 60)",       // Softened Dark Goldenrod
    "Short": "rgb(171, 191, 226)",       // Softened Dark Goldenrod

    // Sub-genres and specific categories
    "Psychological": "rgb(105, 70, 165)",  // Softened Indigo
    "Supernatural": "rgb(180, 110, 195)",  // Softened Medium Orchid
    "Cyberpunk": "rgb(70, 190, 195)",     // Softened Dark Turquoise
    "Superhero": "rgb(225, 110, 65)",     // Softened Red-Orange
    "Disaster": "rgb(185, 70, 70)",       // Softened Firebrick
    "Martial Arts": "rgb(225, 140, 100)",  // Softened Coral
    "Spy": "rgb(65, 65, 165)",            // Softened Midnight Blue
    "Survival": "rgb(190, 120, 70)",      // Softened Chocolate
    "Post-Apocalyptic": "rgb(160, 160, 60)", // Softened Olive
    "Time Travel": "rgb(90, 195, 190)",    // Softened Turquoise

    // Other UI Elements
    "•": "rgb(102, 102, 102)"             // Bullet Point Gray
};

const applyKeywordColor = (text) => {
    if (!text) return text;
    Object.keys(keywordColors).forEach(keyword => {
        const color = keywordColors[keyword];
        const regex = new RegExp(`\\b${keyword}\\b`, 'g');
        text = text.replace(regex, `<span style="color: ${color}; font-weight: bold;">${keyword}</span>`);
    });
    return text;
};

// Function to format list items with bullets
const formatList = (list) => {
    if (!list) return '';
    // If list is an array, use it directly; if not, split it by commas.
    let items = Array.isArray(list) ? list : list.split(',');
    return items.map(item => `• ${applyKeywordColor(item.trim())}`).join('<br>');
};

const applyVerticalSpacing = (list) => {
    if (!list) return '';
    let items = Array.isArray(list) ? list : list.split(',');
    return items.map(item => 
        `<div style="margin-bottom: 52px;">• ${applyKeywordColor(item.trim())}</div>`
    ).join('');
};

const applyDateSpacing = (list) => {
    if (!list) return '';
    let items = Array.isArray(list) ? list : list.split(',');
    let container = dv.el("div", "");
    
    items.forEach(item => {
        const trimmedItem = item.trim();
        const dateDiv = dv.el("div", "", {attr: {style: "margin-bottom: 52px;"}});
        
        // Add bullet point
        dateDiv.appendChild(dv.el("span", "• "));
        
        // If Unknown, add as colored text, otherwise create a link
        if (trimmedItem === "Unknown") {
            const unknownSpan = dv.el("span", trimmedItem, {
                attr: {
                    style: `color: #645a9b; font-weight: bold;`
                }
            });
            dateDiv.appendChild(unknownSpan);
        } else {
            dateDiv.appendChild(dv.span(`[[${trimmedItem}]]`));
        }
        
        container.appendChild(dateDiv);
    });
    
    return container;
};


// Function to process rating value
const processRating = (ratingValue) => {
    if (!ratingValue) return null;
    
    if (ratingValue.toLowerCase().includes('unrated.webp')) {
        return 'unrated';
    }
    return ratingValue;
};

// Update table
const updateTable = () => {
    const table = shows.map(show => {
        // Container for TV show title and poster
        let container = dv.el("div", "", { attr: { style: "display: flex; flex-direction: column;" } });
        
        container.appendChild(dv.span(`**${applyKeywordColor('•')} [[${show.file.name}]]**`));
        
        if (show.poster) {
            container.appendChild(dv.el("span", `![[${show.poster}|400]]`, { attr: { style: "margin-top: 15px;" }}));
        }

        const seasons = applyVerticalSpacing(show.seasons?.join(','));
        const airing = applyVerticalSpacing(show.airing?.join(','));
        const genres = formatList(show.genre || "");
        const status = applyVerticalSpacing(show.status?.join(','));
        const date = applyDateSpacing(show.date?.join(','));

        let ratingContainer = dv.el("div", "", { attr: { style: "display: flex; flex-direction: column;" } });
        
        if (show.rating) {
            show.rating.forEach(rating => {
                const processedRating = processRating(rating);
                let ratingElement;
                
                if (processedRating === 'unrated') {
                    ratingElement = dv.el("span", processedRating, {
                        attr: { style: "margin-bottom: 52px; font-style: italic;" }
                    });
                } else {
                    ratingElement = dv.el("span", `![[${processedRating}|70]]`, {
                        attr: { style: "margin-bottom: 0px;" }
                    });
                }
                ratingContainer.appendChild(ratingElement);
            });
        }

        return [
            container,
            genres,
            seasons,
            airing,
            status,
            date,
            ratingContainer
        ];
    });

    dv.table(
        ["TV-Shows", "Genre", "Seasons", "Airing", "Status", "Date", "Rating"],
        table
    );
};

updateTable();
```




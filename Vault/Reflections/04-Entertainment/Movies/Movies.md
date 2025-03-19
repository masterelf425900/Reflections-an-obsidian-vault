---
cssclasses:
  - table-daily
obsidianUIMode: preview
Sort:
  - The Lord of the Rings The Fellowship of the Ring
  - The Lord of the Rings The Two Towers
  - The Lord of the Rings The Return of the King
  - The Tale of The Princess Kaguya
  - Perfect Blue
  - Grave of the Fireflies
  - How to Train Your Dragon
  - Rango
  - The Shawshank Redemption
  - Everything Everywhere All at Once
Rating: Rating
Status: Status
Year: Year
Month: Month
Genre: Genre
Collection: Collection

---

`INPUT[inlineSelect(class(movies), option(Collection), option(Live-Action), option(2D-Animation), option(3D-Animation)):Collection]` `INPUT[inlineSelect(class(movies),option(Genre), option(Action), option(Adventure), option(Animation), option(Biography), option(Comedy), option(Crime), option(Cyberpunk), option(Disaster), option(Documentary), option(Drama), option(Family), option(Fantasy), option(Film-Noir), option(History), option(Horror), option(Martial Arts), option(Musical), option(Mystery), option(Post-Apocalyptic), option(Psychological), option(Romance), option(Sci-Fi), option(Sport), option(Spy), option(Superhero), option(Survival), option(Thriller), option(Time Travel), option(War), option(Western), option(Supernatural)):Genre]`   `INPUT[inlineSelect(class(movies), option(Status), option(Watched),option(Unwatched), option(Watchlist)):Status]`   `INPUT[inlineSelect(class(movies), option(Year), option(2025)):Year]`   `INPUT[inlineSelect(class(movies), option(Month), option(January), option(February), option(March), option(April), option(May), option(June), option(July), option(August), option(September), option(October), option(November), option(December)):Month]`   `INPUT[inlineSelect(class(movies), option(Rating),option(Mighty), option(Strong),option(Fair), option(Weak)):Rating]`   `BUTTON[Refresh]`

```meta-bind-embed
[[Movies Embeds]]
```



```dataviewjs
// Get all movies first
let movies = dv.pages('"04-Entertainment/Movies"').where(p => p.tags && p.tags.includes('movies'));
let allMovieNames = movies.map(m => m.file.name);

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

// Filter out any movies in currentSort that no longer exist
currentSort = currentSort.filter(name => allMovieNames.includes(name));

// Add any movies that aren't in the sort order yet
let missingMovies = allMovieNames.filter(name => !currentSort.includes(name));
if (missingMovies.length > 0) {
    currentSort = [...currentSort, ...missingMovies];
    update('Sort', currentSort, dv.current().file.path);
}

// Apply Collection filter if specified and not "Collection"
if (currentCollection && currentCollection !== 'Collection') {
    movies = movies.filter(movie => {
        const movieTags = movie.tags || [];
        return movieTags.includes(currentCollection);
    });
}

// Apply other filters
// Filter by Rating if specified and not "Rating"
if (currentRating && currentRating !== 'Rating') {
    movies = movies.filter(movie => {
        const movieRating = movie.rating?.replace('.webp', '');
        return movieRating === currentRating;
    });
}

// Filter by Status if specified and not "Status"
if (currentStatus && currentStatus !== 'Status') {
    movies = movies.filter(movie => {
        return movie.status === currentStatus;
    });
}

// Filter by Genre if specified and not "Genre"
if (currentGenre && currentGenre !== 'Genre') {
    movies = movies.filter(movie => {
        const movieGenres = movie.genre?.split(',').map(g => g.trim()) || 
                          movie.Genre?.split(',').map(g => g.trim()) || [];
        return movieGenres.includes(currentGenre);
    });
}

// Filter by Year and Month if specified and not their field names
if ((currentYear && currentYear !== 'Year') || (currentMonth && currentMonth !== 'Month')) {
    movies = movies.filter(movie => {
        if (!movie.date) return false;
        
        const dateParts = movie.date.split(' ');
        const movieYear = dateParts[0];
        const movieMonth = dateParts[1];
        
        const yearMatch = currentYear === 'Year' || movieYear === currentYear.toString();
        const monthMatch = currentMonth === 'Month' || 
                         movieMonth === currentMonth.substring(0, 3);
        
        return yearMatch && monthMatch;
    });
}

// Sort movies based on the YAML-defined order without refresh
movies = movies.sort(m => currentSort.indexOf(m.file.name));

// Define color codes for specific keywords
const keywordColors = {
    // Status Colors
    "Unknown": "rgb(100, 90, 155)",      // Purple
    "Watched": "rgb(26, 188, 156)",       // Lime Green
    "Unwatched": "rgb(220, 86, 151)",     // Tomato Red
    "Watchlist": "rgb(171, 191, 226)",    // Gold
    "In Progress": "rgb(255, 165, 0)",    // Orange
    
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

// Enhanced function to apply color to matching keywords
const applyKeywordColor = (text) => {
    if (!text) return '';
    let coloredText = text;
    
    const sortedKeywords = Object.keys(keywordColors).sort((a, b) => b.length - a.length);
    
    for (const keyword of sortedKeywords) {
        const color = keywordColors[keyword];
        const regex = keyword === '•' 
            ? new RegExp(keyword, 'g')
            : new RegExp(`\\b${keyword}\\b`, 'g');
        coloredText = coloredText.replace(regex, `<span style="color: ${color}; font-weight: bold;">${keyword}</span>`);
    }
    return coloredText;
};

// Function to prepare list items with colored bullets
const formatList = (list) => {
    if (!list) return '';
    return list.split(',')
        .map(item => {
            const bullet = `<span style="color: ${keywordColors['•']}; font-weight: bold;">•</span>`;
            return `${bullet} <span style="font-weight: bold">${applyKeywordColor(item.trim())}</span>`;
        })
        .join('<br>');
};

// Function to check if a date string contains numbers
const containsNumbers = (str) => /\d/.test(str);

// Updated updateTable function
const updateTable = () => {
    table.length = 0;
    for (let movie of movies) {
        let container = dv.el("div", "", { attr: { style: "display: flex; flex-direction: column;" } });
        
        // Create simple movie title display
        container.appendChild(dv.span(`**${applyKeywordColor('•')} [[${movie.file.name}]]**`));
        
        // Add poster if it exists
        if (movie.poster) {
            container.appendChild(dv.el("span", "![[" + movie.poster + "|400]]", { attr: { style: "margin-top: 15px;" }}));
        }
        
        // Format genres with colored bullets
        let genreContent = formatList(movie.genre || movie.Genre);
        
        // Get status and date, applying colors where needed
        let statusContent = movie.status ? applyKeywordColor(`• ${movie.status}`) : '';
        let dateContent = '';
        if (movie.date) {
            if (containsNumbers(movie.date)) {
                dateContent = applyKeywordColor(`• [[${movie.date}]]`);
            } else {
                dateContent = applyKeywordColor(`• ${movie.date}`);
            }
        }
        
        // Rating element if it exists
        let ratingContent = movie.rating 
            ? dv.el("span", "![[" + movie.rating + "|75]]", { attr: { style: "margin-top: 0px;" } })
            : '';
        
        table.push([
            container,
            genreContent ? dv.el("div", genreContent, { attr: { style: "text-align: left;" }, html: true }) : '',
            statusContent ? dv.el("div", statusContent, { attr: { style: "text-align: left;" }, html: true }) : '',
            dateContent ? dv.el("div", dateContent, { attr: { style: "text-align: left;" }, html: true }) : '',
            ratingContent
        ]);
    }

    dv.table(
        ["Movie", "Genre", "Status", "Date", "Rating"],
        table
    );
};

// Initialize table for the first time
let table = [];
updateTable();
```



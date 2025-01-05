const apiKey = "9cb98dcf32b707f850447ae990ea132e";
const imgApi = "https://image.tmdb.org/t/p/w1280";
const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=`;
const imdbUrl = `https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&language=en-US&page=1`;

const form = document.getElementById("search-form");
const query = document.getElementById("search-input");
const result = document.getElementById("result");
const imdbList = document.getElementById("imdb-list");
const suggestionContainer = document.getElementById("suggestion");
const favoritesList = document.getElementById("favorites-list");
const themeToggle = document.getElementById("theme-toggle");

let page = 1;
let isSearching = false;
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

// Fetch JSON data from URL
async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Network response was not ok.");
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}

// Fetch and show results
async function fetchAndShowResult(url) {
    const data = await fetchData(url);
    if (data && data.results) {
        showResults(data.results);
    }
}

// Create movie card template
function createMovieCard(movie) {
    const { poster_path, original_title, release_date, overview } = movie;
    const imagePath = poster_path ? imgApi + poster_path : "./img-01.jpeg";
    const truncatedTitle = original_title.length > 15 ? original_title.slice(0, 15) + "..." : original_title;
    const formattedDate = release_date || "No release date";
    const cardTemplate = `
        <div class="column">
            <div class="card">
                <a class="card-media" href="./img-01.jpeg">
                    <img src="${imagePath}" alt="${original_title}" width="100%" />
                </a>
                <div class="card-content">
                    <div class="card-header">
                        <div class="left-content">
                            <h3 style="font-weight: 600">${truncatedTitle}</h3>
                            <span style="color: #12efec">${formattedDate}</span>
                        </div>
                        <div class="right-content">
                            <button onclick='addToFavorites(${JSON.stringify(
                                movie
                            )})'>Add to Favorites</button>
                        </div>
                    </div>
                    <div class="info">
                        ${overview || "No overview yet..."}
                    </div>
                </div>
            </div>
        </div>
    `;
    return cardTemplate;
}

// Clear results
function clearResults() {
    result.innerHTML = "";
}

// Show results
function showResults(items) {
    const newContent = items.map(createMovieCard).join("");
    result.innerHTML += newContent || "<p>No results found.</p>";
}

// Load more results
async function loadMoreResults() {
    if (isSearching) {
        return;
    }
    page++;
    const searchTerm = query.value;
    const url = searchTerm
        ? `${searchUrl}${searchTerm}&page=${page}`
        : `https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=${apiKey}&page=${page}`;
    await fetchAndShowResult(url);
}

// Detect end of page
function detectEnd() {
    const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 20) {
        loadMoreResults();
    }
}

// Handle search
async function handleSearch(e) {
    e.preventDefault();
    const searchTerm = query.value.trim();
    if (searchTerm) {
        isSearching = true;
        clearResults();
        const newUrl = `${searchUrl}${searchTerm}&page=${page}`;
        await fetchAndShowResult(newUrl);
        query.value = "";
    }
}

// Favoriler Listesini Gösterme
function renderFavorites() {
    favoritesList.innerHTML = favorites
        .map(
            (movie) =>
                `<li>${movie.original_title} 
                <button onclick="removeFromFavorites('${movie.id}')">Remove</button></li>`
        )
        .join("");
}
// Add to Favorites
function addToFavorites(movie) {
    if (!favorites.find((fav) => fav.id === movie.id)) {
        favorites.push(movie);
        localStorage.setItem("favorites", JSON.stringify(favorites));
        renderFavorites();
    }
}

// Favorilerden Film Kaldırma
function removeFromFavorites(id) {
    // Favoriler listesinden ilgili filmi ID'ye göre filtrele
    favorites = favorites.filter((movie) => movie.id !== parseInt(id));
    
    // Güncellenmiş favorileri localStorage'a kaydet
    localStorage.setItem("favorites", JSON.stringify(favorites));
    
    // Favoriler listesini yeniden render et
    renderFavorites();
}

// Load IMDB Top 20
async function loadImdbTop20() {
    const data = await fetchData(imdbUrl);
    if (data && data.results) {
        imdbList.innerHTML = data.results
            .slice(0, 20)
            .map(
                (movie, index) =>
                    `<li><strong>${index + 1}.</strong> ${movie.title} <span>(${movie.vote_average}/10)</span></li>`
            )
            .join("");
    }
}

// Fetch Movie of the Day
async function fetchMovieOfTheDay() {
    const data = await fetchData(imdbUrl);
    if (data && data.results.length) {
        const randomMovie =
            data.results[Math.floor(Math.random() * data.results.length)];
        suggestionContainer.innerHTML = `
            <h3>${randomMovie.title}</h3>
            <p>Rating: ${randomMovie.vote_average}/10</p>
            <p>${randomMovie.overview}</p>`;
    }
}



// Event listeners
form.addEventListener("submit", handleSearch);
window.addEventListener("scroll", detectEnd);
window.addEventListener("resize", detectEnd);

// Initialize
async function init() {
    clearResults();
    const url = `https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=${apiKey}&page=${page}`;
    await fetchAndShowResult(url);
    await loadImdbTop20();
    await fetchMovieOfTheDay();
    renderFavorites();
    isSearching = false;
}

init();

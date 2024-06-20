document.addEventListener("DOMContentLoaded", () => {
  const searchField = document.getElementById("search-field");
  const resultsSection = document.querySelector(".results ul");
  const spinner = document.querySelector(".loading");

  const apiUrl = "https://demo.dataverse.org/api/search";

  let searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];

  function displaySearchHistory() {
    searchHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    resultsSection.innerHTML = searchHistory
      .map(
        (item) => `
          <li>
            <div class="left">${item.title}</div>
            <div class="timestamp">
              <span>${new Date(item.timestamp).toLocaleDateString()} ${new Date(
          item.timestamp
        ).toLocaleTimeString()}</span>
              <button class="icon-close" data-title="${item.title}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M18.3 5.7c-.4-.4-1-.4-1.4 0L12 10.6 7.1 5.7C6.7 5.3 6.1 5.3 5.7 5.7c-.4.4-.4 1 0 1.4L10.6 12l-4.9 4.9c-.4.4-.4 1 0 1.4.4.4 1 .4 1.4 0L12 13.4l4.9 4.9c.4.4 1 .4 1.4 0 .4-.4.4-1 0-1.4L13.4 12l4.9-4.9c.4-.4.4-1 0-1.4z" />
                </svg>
              </button>
            </div>
          </li>
        `
      )
      .join("");

    const closeButtons = document.querySelectorAll(".icon-close[data-title]");
    closeButtons.forEach((button) =>
      button.addEventListener("click", (e) => {
        const title = e.currentTarget.getAttribute("data-title");
        removeFromSearchHistory(title);
      })
    );
  }

  function removeFromSearchHistory(title) {
    searchHistory = searchHistory.filter((item) => item.title !== title);
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
    displaySearchHistory();
  }

  function clearSearchHistory() {
    searchHistory = [];
    localStorage.removeItem("searchHistory");
    displaySearchHistory();
  }

  function addToSearchHistory(title) {
    const timestamp = new Date();
    searchHistory.push({ title, timestamp });
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
    alert(title + " added to search history!");
    displaySearchHistory();
    searchField.value = "";
  }

  document.querySelector(".main .icon-close").addEventListener("click", () => {
    searchField.value = "";
    searchResults = [];
    displaySearchHistory();
  });

  document
    .querySelector(".results a")
    .addEventListener("click", clearSearchHistory);

  searchField.addEventListener("input", async (e) => {
    const query = e.target.value.trim();
    if (query.length === 0) {
      searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
      displaySearchHistory();
      return;
    }

    spinner.style.display = "flex";

    try {
      const response = await fetch(`${apiUrl}?q=${query}`);
      const data = await response.json();

      const searchResults = data.data.items.map((item) => ({
        title: item.name,
        published_at: item.published_at,
      }));

      resultsSection.innerHTML = searchResults
        .map(
          (result) => `
            <li class="result-item" data-title="${result.title}">
              <div class="left">${result.title}</div>
              <div class="timestamp">${result.published_at}</div>
            </li>
          `
        )
        .join("");

      const resultItems = document.querySelectorAll(".result-item");
      resultItems.forEach((li) =>
        li.addEventListener("click", (e) => {
          const title = e.currentTarget.getAttribute("data-title");
          addToSearchHistory(title);
        })
      );
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      spinner.style.display = "none";
    }
  });

  displaySearchHistory();
});

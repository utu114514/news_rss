document.addEventListener("DOMContentLoaded", () => {
    const rssListContainer = document.getElementById("rss-list");
    const rssContainer = document.getElementById("rss-container");
    const saveButton = document.getElementById("save");

    // RSSリストの読み込み
    fetch("rss.json")
        .then(response => response.json())
        .then(rssList => {
            rssList.forEach(feed => {
                const label = document.createElement("label");
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.value = feed.url;
                checkbox.checked = getSavedFeeds().includes(feed.url);
                label.appendChild(checkbox);
                label.appendChild(document.createTextNode(feed.name));
                rssListContainer.appendChild(label);
                rssListContainer.appendChild(document.createElement("br"));
            });
        });

    // Cookie（またはlocalStorage）に設定を保存
    saveButton.addEventListener("click", () => {
        const selectedFeeds = Array.from(document.querySelectorAll("#rss-list input:checked"))
            .map(input => input.value);
        document.cookie = `feeds=${JSON.stringify(selectedFeeds)}; path=/; max-age=31536000`;
        alert("設定を保存しました。");
        loadFeeds();
    });

    function getSavedFeeds() {
        const match = document.cookie.match(/feeds=([^;]+)/);
        return match ? JSON.parse(match[1]) : [];
    }

    function loadFeeds() {
        rssContainer.innerHTML = "";
        getSavedFeeds().forEach(feedUrl => {
            fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`)
                .then(response => response.json())
                .then(data => {
                    data.items.forEach(item => {
                        const article = document.createElement("div");
                        article.innerHTML = `<h3><a href="${item.link}" target="_blank">${item.title}</a></h3>`;
                        rssContainer.appendChild(article);
                    });
                });
        });
    }

    loadFeeds();
});

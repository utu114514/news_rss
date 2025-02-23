document.addEventListener("DOMContentLoaded", () => {
    const mainTab = document.getElementById("main");
    const settingTab = document.getElementById("setting");
    const rssListContainer = document.getElementById("rss-list");
    const articleList = document.getElementById("article-list");
    const saveButton = document.getElementById("save-settings");
    const tabButtons = document.querySelectorAll(".tab-button");
    
    // タブ切り替え
    tabButtons.forEach(button => {
        button.addEventListener("click", () => {
            document.querySelector(".tab-button.active").classList.remove("active");
            button.classList.add("active");
            document.querySelector(".tab-content.active").classList.remove("active");
            document.getElementById(button.dataset.tab).classList.add("active");
        });
    });
    
    // RSSリストを取得
    fetch("rss.json")
        .then(response => response.json())
        .then(data => {
            const savedFeeds = getSavedFeeds();
            data.feeds.forEach(feed => {
                const label = document.createElement("label");
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.value = feed.url;
                checkbox.checked = savedFeeds.includes(feed.url);
                label.appendChild(checkbox);
                label.append(feed.name);
                rssListContainer.appendChild(label);
            });
        });
    
    // 設定保存
    saveButton.addEventListener("click", () => {
        const selectedFeeds = Array.from(document.querySelectorAll("#rss-list input:checked"))
            .map(input => input.value);
        document.cookie = `selectedFeeds=${JSON.stringify(selectedFeeds)}; path=/`;
        alert("設定を保存しました。");
        fetchArticles();
    });
    
    // Cookieから選択したフィードを取得
    function getSavedFeeds() {
        const cookies = document.cookie.split("; ").find(row => row.startsWith("selectedFeeds="));
        return cookies ? JSON.parse(cookies.split("=")[1]) : [];
    }
    
    // 記事を取得して表示
    function fetchArticles() {
        articleList.innerHTML = "";
        const feeds = getSavedFeeds();
        if (feeds.length === 0) return;
        
        let allArticles = [];
        let fetchPromises = feeds.map(feedUrl => {
            return fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`)
                .then(response => response.json())
                .then(data => {
                    data.items.forEach(item => {
                        allArticles.push({
                            title: item.title,
                            link: item.link,
                            date: new Date(item.pubDate),
                            source: data.feed.title
                        });
                    });
                });
        });
        
        Promise.all(fetchPromises).then(() => {
            allArticles.sort((a, b) => b.date - a.date);
            allArticles.forEach(article => {
                const row = document.createElement("tr");
                row.innerHTML = `<td><a href="${article.link}" target="_blank">${article.title}</a></td>
                                 <td>${article.date.toLocaleString("ja-JP", {month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit"})}</td>
                                 <td>${article.source}</td>`;
                articleList.appendChild(row);
            });
        });
    }
    
    fetchArticles();
});

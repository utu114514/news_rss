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
        
        feeds.forEach(feedUrl => {
            fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`)
                .then(response => response.json())
                .then(data => {
                    data.items.forEach(item => {
                        const row = document.createElement("tr");
                        row.innerHTML = `<td><a href="${item.link}" target="_blank">${item.title}</a></td>
                                         <td>${new Date(item.pubDate).toLocaleString("ja-JP", {month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit"})}</td>
                                         <td>${data.feed.title}</td>`;
                        articleList.appendChild(row);
                    });
                });
        });
    }
    
    fetchArticles();
});

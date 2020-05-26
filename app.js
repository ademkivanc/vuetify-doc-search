
const apiUrl = 'https://bh4d9od16a-dsn.algolia.net/1/indexes/*/queries?x-algolia-application-id=BH4D9OD16A&x-algolia-api-key=259d4615e283a1bbaa3313b4eff7881c';

function main() {

    const selectBox = document.querySelector(".select-css");

    // The autoComplete.js Engine instance creator
    const autoCompletejs = new autoComplete({
        data: {
            src: async () => {

                const query = document.querySelector("#autoComplete").value;

                // Fetch External Data Source
                const source = await fetch(apiUrl, {
                    "headers": {
                        "accept": "application/json",
                        "content-type": "application/x-www-form-urlencoded",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "cross-site"
                    },
                    "body": '{"requests":[{"indexName":"vuetifyjs","params":"query=' + query + '&hitsPerPage=5"}]}',
                    "method": "POST",
                    "mode": "cors"
                });
                const data = await source.json();

                // Return Fetched data
                return data.results[0].hits;
            },
            key: ["anchor", "content", { "hierarchy": "lvl0" }],
            cache: false
        },
        placeHolder: "Vuetify documentation search",
        selector: "#autoComplete",
        threshold: 1,
        debounce: 300,
        searchEngine: (query, record) => {
            return record;
        },
        highlight: false,
        maxResults: 5,
        resultsList: {
            render: true,
            container: source => {
                source.setAttribute("id", "autoComplete_list");
            },
            destination: document.querySelector("#autoComplete"),
            position: "afterend",
            element: "ul"
        },
        resultItem: {
            content: (data, source) => {

                if (data.value.hierarchy.lvl1 === null) {
                    data.value.hierarchy.lvl1 = data.value.hierarchy.lvl0
                }

                if (data.value.hierarchy.lvl2 === null) {
                    data.value.hierarchy.lvl2 = data.value.hierarchy.lvl1
                }

                if (data.value.content === null) {
                    data.value.content = data.value.hierarchy.lvl2
                }

                let html = `
                    <div class='title'>${data.value.hierarchy.lvl0}</div>
                    <div class='wrap'>
                        <div class='label'>${data.value.hierarchy.lvl1}</div>
                        <div class='value'>
                            <div>${data.value.hierarchy.lvl2}</div>
                            <div class="caption">${data.value.content}</div>
                        </div>
                    </div>
                    `;

                source.innerHTML = html;
            },
            element: "li"
        },
        noResults: () => {
            const result = document.createElement("li");
            result.setAttribute("class", "autoComplete_result");
            result.setAttribute("tabindex", "1");
            result.innerHTML = "No results";
            document.querySelector("#autoComplete_list").appendChild(result);
        },
        onSelection: feedback => {
            const selection = feedback.selection.value.anchor;

            // Clear Input
            document.querySelector("#autoComplete").value = "";
            // Change placeholder with the selected value
            document
                .querySelector("#autoComplete")
                .setAttribute("placeholder", selection);

            let selectedHost = selectBox.options[selectBox.selectedIndex].value;

            const url = new URL(feedback.selection.value.url);
            let newUrl = url.protocol + '//' + selectedHost + url.pathname + url.hash

            chrome.tabs.create({ url: newUrl });
        }
    });


    // Toggle event for search input
    // showing & hidding results list onfocus / blur
    ["focus", "blur"].forEach(function (eventType) {
        const resultsList = document.querySelector("#autoComplete_list");

        document.querySelector("#autoComplete").addEventListener(eventType, function () {
            // Hide results list & show other elemennts
            if (eventType === "blur") {
                resultsList.style.display = "none";
            } else if (eventType === "focus") {
                // Show results list & hide other elemennts
                resultsList.style.display = "block";
            }
        });
    });


    //default set
    chrome.storage.sync.get("host", function (items) {
        if (!chrome.runtime.error) {
            if (items.host)
                selectBox.value = items.host;

        }
    });

}

document.addEventListener('DOMContentLoaded', function () {

    document.querySelector('select').addEventListener('change', (event) => {
        chrome.storage.sync.set({ "host": event.target.value }, function () {
            if (chrome.runtime.error) {
                console.log("Runtime error.");
            }
        });
    });

    main();

});

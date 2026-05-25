
const API_BASE = "http://127.0.0.1:8000";


// =========================
// FETCH REPOSITORIES
// =========================

async function fetchRepos() {

    console.log("FETCHING REPOS");

    const username = document.getElementById(
        "usernameInput"
    ).value;

    const response = await fetch(
        `${API_BASE}/users/${username}/repos`
    );

    const data = await response.json();

    console.log("API DATA:", data);

    const repoList = document.getElementById(
        "repoList"
    );

    repoList.innerHTML = "";

    const repos = data.repositories || [];

    repos.forEach(repo => {

        const repoCard = document.createElement("div");

        repoCard.className = "repo-card";

        repoCard.innerHTML = `
            <h3>${repo.name}</h3>

            <p>${repo.full_name}</p>

            <button>
                Select Repository
            </button>
        `;

        repoCard.querySelector("button")
            .addEventListener(
                "click",
                () => loadRepo(repo.full_name)
            );

        repoList.appendChild(repoCard);
    });
}



// =========================
// LOAD REPOSITORY
// =========================

async function loadRepo(repoName) {

    const response = await fetch(
        `${API_BASE}/load-repo`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                repo_name: repoName
            })
        }
    );

    const data = await response.json();

    console.log(data);

    alert(data.message);
}



// =========================
// ASK QUESTION
// =========================

async function askQuestion() {

    const question = document.getElementById(
        "questionInput"
    ).value;

    const response = await fetch(
        `${API_BASE}/ask`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                question: question
            })
        }
    );

    const data = await response.json();

    console.log("ASK RESPONSE:", data);

    const responseBox = document.getElementById(
        "responseBox"
    );

    responseBox.innerHTML = `
        <h2>🤖 AI Answer</h2>

        <p>
            ${data.answer || data.response || "No answer returned"}
        </p>

        <h2>📂 Source Files</h2>

        <ul>
            ${
                (data.sources || []).map(
                    source => `<li>${source}</li>`
                ).join("")
            }
        </ul>
    `;
}



// =========================
// GENERATE ROADMAP
// =========================

async function generateRoadmap() {

    const response = await fetch(
        `${API_BASE}/generate-roadmap`
    );

    const data = await response.json();

    console.log(data);

    document.getElementById(
        "roadmapBox"
    ).innerHTML = `
        <h2>🧠 AI Learning Roadmap</h2>

        <pre>
            ${data.roadmap || "No roadmap generated"}
        </pre>
    `;
}


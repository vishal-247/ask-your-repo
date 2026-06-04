const API_BASE = "http://127.0.0.1:8000";


// ======================================
// FETCH REPOSITORIES
// ======================================

async function fetchRepos() {

    const username =
        document.getElementById(
            "usernameInput"
        ).value;

    if (!username) {

        alert("Enter GitHub username");

        return;
    }

    try {

        const response = await fetch(
            `${API_BASE}/users/${username}/repos`
        );

        const data =
            await response.json();

        console.log(data);

        const repoList =
            document.getElementById(
                "repoList"
            );

        repoList.innerHTML = "";

        const repos =
            data.repositories || [];

        repos.forEach(repo => {

            const repoCard =
                document.createElement("div");

            repoCard.className =
                "repo-card";

            repoCard.innerHTML = `
                <h3>${repo.name}</h3>

                <p>${repo.full_name}</p>

                <button>
                    Select Repository
                </button>
            `;

            repoCard
                .querySelector("button")
                .addEventListener(
                    "click",
                    () =>
                    loadRepo(
                        repo.full_name
                    )
                );

            repoList.appendChild(
                repoCard
            );
        });

    }
    catch(error) {

        console.error(error);

        alert(
            "Failed to fetch repositories"
        );
    }
}



// ======================================
// LOAD REPOSITORY
// ======================================

async function loadRepo(repoName) {

    try {

        const response = await fetch(
            `${API_BASE}/load-repo`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                    "application/json"
                },

                body: JSON.stringify({
                    repo_name:
                    repoName
                })
            }
        );

        const data =
            await response.json();

        console.log(data);

        alert(
            data.message ||
            "Repository Loaded"
        );

        document.getElementById(
            "selectedRepoBox"
        ).innerHTML = `
            <h2>
                ✅ Active Repository
            </h2>

            <p>
                ${repoName}
            </p>
        `;

        visualizeArchitecture();

    }
    catch(error) {

        console.error(error);

        alert(
            "Repository load failed"
        );
    }
}



// ======================================
// ASK QUESTION
// ======================================

async function askQuestion() {

    const question =
        document.getElementById(
            "questionInput"
        ).value;

    try {

        const response = await fetch(
            `${API_BASE}/ask`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                    "application/json"
                },

                body: JSON.stringify({
                    question
                })
            }
        );

        const data =
            await response.json();

        console.log(data);

        document.getElementById(
            "responseBox"
        ).innerHTML = `
            <h2>
                🤖 AI Answer
            </h2>

            <p>
                ${
                    data.answer ||
                    data.response ||
                    "No Answer"
                }
            </p>

            <h2>
                📂 Source Files
            </h2>

            <ul>
                ${
                    (data.sources || [])
                    .map(
                        source =>
                        `<li>${source}</li>`
                    )
                    .join("")
                }
            </ul>
        `;

    }
    catch(error) {

        console.error(error);

        alert(
            "Question failed"
        );
    }
}



// ======================================
// GENERATE ROADMAP
// ======================================

async function generateRoadmap() {

    try {

        const response = await fetch(
            `${API_BASE}/generate-roadmap`
        );

        const data =
            await response.json();

        const roadmapBox =
            document.getElementById(
                "roadmapBox"
            );

        roadmapBox.innerHTML =
            "<h2>🧠 AI Learning Roadmap</h2>";

        const roadmapLines =
            (data.roadmap || "")
            .split("\n");

        roadmapLines.forEach(
            line => {

                if (
                    line.trim() !== ""
                ) {

                    roadmapBox.innerHTML += `
                        <div class="roadmap-step">
                            ${line}
                        </div>
                    `;
                }
            }
        );

    }
    catch(error) {

        console.error(error);

        alert(
            "Roadmap generation failed"
        );
    }
}



// ======================================
// VISUALIZE ARCHITECTURE
// ======================================

async function visualizeArchitecture() {

    const architectureBox =
        document.getElementById(
            "architectureBox"
        );

    architectureBox.innerHTML =
        "<h2>Loading Architecture...</h2>";

    try {

        const response = await fetch(
            `${API_BASE}/architecture`
        );

        const data =
            await response.json();

        console.log(
            "ARCHITECTURE DATA:",
            data
        );

        architectureBox.innerHTML =
            "<h2>🏗 Architecture Visualization</h2>";

        if (!data.layers) {

            architectureBox.innerHTML += `
                <p>
                    No architecture data found
                </p>
            `;

            return;
        }

        data.layers.forEach(
            (layer, index) => {

                architectureBox.innerHTML += `

                    <div class="architecture-layer">

                        <h3>
                            ${layer.name}
                        </h3>

                        ${
                            (layer.components || [])
                            .map(
                                component => `
                                    <div class="architecture-node">
                                        ${component}
                                    </div>
                                `
                            )
                            .join("")
                        }

                    </div>

                    ${
                        index !==
                        data.layers.length - 1

                        ? `
                            <div class="arrow">
                                ⬇️
                            </div>
                          `

                        : ""
                    }
                `;
            }
        );

    }
    catch(error) {

        console.error(error);

        architectureBox.innerHTML = `
            <h2>
                Architecture Error
            </h2>

            <p>
                ${error}
            </p>
        `;
    }
}

// ======================================
// VISUALIZE GRAPH
// ======================================

// async function visualizeGraph() {

//     const response = await fetch(
//         `${API_BASE}/graph`
//     );

//     const data = await response.json();

//     const architectureBox =
//         document.getElementById(
//             "architectureBox"
//         );

//     architectureBox.innerHTML =
//         "<h2>🏗 Repository Flow</h2>";

//     data.nodes.forEach(
//         (node, index) => {

//             architectureBox.innerHTML += `

//                 <div
//                     class="architecture-node"
//                     onclick="toggleComponents('${node.name}')"
//                 >

//                     ${node.name}

//                 </div>

//                 <div
//                     id="${node.name}"
//                     class="component-box"
//                     style="display:none;"
//                 >

//                     ${
//                         node.components.map(
//                             component =>
//                                 `<p>${component}</p>`
//                         ).join("")
//                     }

//                 </div>

//             `;

//             if (
//                 index <
//                 data.nodes.length - 1
//             ) {

//                 architectureBox.innerHTML +=
//                     `<div class="arrow">⬇️</div>`;
//             }
//         }
//     );
// }
// function toggleComponents(id) {

//     const box =
//         document.getElementById(id);

//     if (
//         box.style.display === "none"
//     ) {

//         box.style.display = "block";

//     } else {

//         box.style.display = "none";
//     }
// }

async function visualizeGraph() {

    const response =
        await fetch(
            `${API_BASE}/graph`
        );

    const data =
        await response.json();

    console.log(
        "GRAPH DATA:",
        data
    );
}

async function visualizeGraphNetwork() {

    const response =
        await fetch(
            `${API_BASE}/architecture`
        );

    const data =
        await response.json();

    const nodes = [];

    const edges = [];

    data.layers.forEach(
        (layer, index) => {

            nodes.push({

                id: index,

                label: layer.name
            });

            if (index > 0) {

                edges.push({

                    from: index - 1,

                    to: index
                });
            }
        }
    );

    const container =
        document.getElementById(
            "graphContainer"
        );

    new vis.Network(

        container,

        {
            nodes,
            edges
        },

        {}
    );
}
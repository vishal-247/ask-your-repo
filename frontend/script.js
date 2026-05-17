const API_BASE = "http://127.0.0.1:8000";


async function loadRepo() {

    const repoName = document.getElementById(
        "repoInput"
    ).value;

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

    console.log(data);

    const responseBox = document.getElementById(
        "responseBox"
    );

    responseBox.innerHTML = `
        <h2>🤖 AI Answer</h2>

        <p>${data.answer}</p>

        <h2>📂 Source Files</h2>

        <ul>
            ${data.sources.map(
                source =>
                `<li>${source}</li>`
            ).join("")}
        </ul>
    `;
}
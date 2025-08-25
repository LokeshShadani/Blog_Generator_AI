const form = document.getElementById("blog-form");
const topicInput = document.getElementById("topic");
const resultDiv = document.getElementById("result");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const topic = topicInput.value.trim();
  if (!topic) {
    resultDiv.innerHTML = "<p style='color:red'>Please enter a topic.</p>";
    return;
  }

  resultDiv.innerHTML = "<p>Generating blog... ⏳</p>";

  try {
    const response = await fetch("http://127.0.0.1:5000/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ topic })
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();

    if (data.blog) {
      resultDiv.innerHTML = `<h2>Generated Blog</h2><p>${data.blog.replace(/\n/g, "<br>")}</p>`;
    } else {
      resultDiv.innerHTML = `<p style='color:red'>${data.error || "Something went wrong."}</p>`;
    }
  } catch (error) {
    resultDiv.innerHTML = `<p style='color:red'>Error: ${error.message}</p>`;
  }
});

const generateBtn = document.getElementById("generateBtn");
const logoContainer = document.getElementById("logoContainer");
const loading = document.getElementById("loading");

const HUGGINGFACE_API_KEY = "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";
const API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0";

async function generateLogos() {
    const brandName = document.getElementById("brandName").value.trim();
    const promptInput = document.getElementById("prompt").value.trim();
    const logoCount = parseInt(document.getElementById("logoCount").value);

    if (!brandName || !promptInput) {
        alert("Please enter both brand name and prompt!");
        return;
    }

    logoContainer.innerHTML = "";
    loading.classList.remove("hidden");

    for (let i = 0; i < logoCount; i++) {
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    inputs: `Professional logo for "${brandName}" | Style: ${promptInput} | Minimalistic, modern, high-quality`,
                }),
            });

            if (!response.ok) throw new Error("API request failed");
            const imageBlob = await response.blob();
            const imageURL = URL.createObjectURL(imageBlob);

            const card = document.createElement("div");
            card.classList.add("logo-card");
            card.innerHTML = `
                <img src="${imageURL}" alt="Generated Logo">
                <a href="${imageURL}" download="${brandName}_logo_${i + 1}.png">
                    <button class="download-btn">Download</button>
                </a>
            `;
            logoContainer.appendChild(card);
        } catch (error) {
            console.error(error);
            alert("Error generating logos. Try again later.");
        }
    }

    loading.classList.add("hidden");
}

generateBtn.addEventListener("click", generateLogos);

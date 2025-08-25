import os
import requests
from flask import Flask, render_template, request, send_file
from io import BytesIO

app = Flask(__name__)

# Hugging Face API key
HF_API_KEY = "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"
MODEL = "black-forest-labs/FLUX.1-schnell"

# Home page
@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        brand_name = request.form.get("brand")
        prompt = request.form.get("prompt")
        
        # Clean, high-quality logo generation prompt
        final_prompt = f"Minimal, modern, clean, professional logo for '{brand_name}'. {prompt}. No extra text, no clutter, flat style."

        # Call Hugging Face API
        response = requests.post(
            f"https://api-inference.huggingface.co/models/{MODEL}",
            headers={"Authorization": f"Bearer {HF_API_KEY}"},
            json={"inputs": final_prompt},
        )

        if response.status_code == 200:
            image_data = BytesIO(response.content)
            return send_file(image_data, mimetype="image/png")
        else:
            return f"Error: {response.text}"

    return render_template("index.html")
    

if __name__ == "__main__":
    app.run(debug=True)

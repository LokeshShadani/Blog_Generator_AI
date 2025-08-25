from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = Flask(__name__)
CORS(app)

@app.route("/generate", methods=["POST"])
def generate_blog():
    try:
        data = request.get_json()
        topic = data.get("topic", "")
        keywords = data.get("keywords", "")
        lang = data.get("lang", "en")  # <-- language parameter

        if not topic.strip():
            return jsonify({"error": "Please provide a blog topic"}), 400

        model = genai.GenerativeModel("gemini-1.5-flash")

        # Updated prompt with language
        blog_prompt = (
            f"Write a well-structured, SEO-friendly, detailed blog on: {topic}. "
            f"Language: {'Hindi' if lang=='hi' else 'English'}. "
            f"Include headings, subheadings, bullet points, and a conclusion. "
            f"Also, suggest a catchy and professional blog title for this article."
        )

        response = model.generate_content(blog_prompt)

        if not hasattr(response, "text") or not response.text:
            return jsonify({"error": "Empty response from Gemini API"}), 500

        text = response.text
        title = ""
        if "Title:" in text:
            parts = text.split("Title:")
            if len(parts) > 1:
                title_line = parts[1].split("\n")[0].strip()
                title = title_line

        return jsonify({"blog": text, "title": title or topic})

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)

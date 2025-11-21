from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json

app = Flask(__name__)
CORS(app)

JSON_URL = "https://files.ofpisnotdead.com/reforger-workshop.json"

def load_mods():
    r = requests.get(JSON_URL, headers={"User-Agent": "Mozilla/5.0"})
    r.raise_for_status()
    data = json.loads(r.text)

    # формат: { "data": [ ... ] }
    if isinstance(data, dict) and "data" in data:
        return data["data"]

    return data

def get_mod_count():
    mods = load_mods()
    return len(mods)

# -------------------------------------------------------
# /search (старый формат ответа)
# -------------------------------------------------------
@app.route("/search")
def search_api():
    query = request.args.get("name", "").strip().lower()

    if not query:
        return jsonify({"error": "Parameter 'name' is required"}), 400

    try:
        mods = load_mods()

        results = []
        for mod in mods:
            if query not in mod["name"].lower():
                continue

            results.append({
                "modName": mod["name"],
                "modId": mod["id"],
                "author": mod.get("author"),
                "size": mod.get("currentVersionSize"),
                "image": mod.get("preview")
            })

        return jsonify(results)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -------------------------------------------------------
# /mods  (старый формат, но без dependencies)
# -------------------------------------------------------
@app.route("/mods", methods=["POST"])
def get_mods_info():
    data = request.get_json()

    if not data or "mods" not in data:
        return jsonify({"error": "Parameter 'mods' is required"}), 400

    mod_ids = set(data["mods"])

    try:
        all_mods = load_mods()
        results = []

        for mod in all_mods:
            if mod["id"] not in mod_ids:
                continue

            results.append({
                "modId": mod["id"],
                "modName": mod["name"],
                "author": mod.get("author"),
                "version": mod.get("currentVersionNumber"),
                "size": mod.get("currentVersionSize")
            })

        return jsonify(results)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/count")
def mod_count_api():
    try:
        mods = load_mods()
        return jsonify({"count": len(mods)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000)

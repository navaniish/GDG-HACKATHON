from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/data")
def data():
    return jsonify({
        "alert": True,
        "room": 204,
        "people": [
            {"room": 201, "type": "survivor"},
            {"room": 204, "type": "threat"},
            {"room": 208, "type": "survivor"}
        ]
    })

if __name__ == "__main__":
    print("SENTINEL-X Backend Operational: http://127.0.0.1:5000")
    app.run(port=5000, debug=True)

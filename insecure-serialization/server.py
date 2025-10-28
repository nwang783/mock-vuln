import pickle
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/deserialize', methods=['POST'])
def deserialize():
    data = request.form.get('data', '')
    try:
        obj = pickle.loads(data.encode('latin1', errors='ignore'))  # type: ignore[arg-type]
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    return jsonify({"ok": True, "type": str(type(obj))})

if __name__ == '__main__':
    app.run(port=5002)

from flask import Flask, request, jsonify, send_file
import base64
import json
import os
import pickle
import subprocess
import requests

app = Flask(__name__)
app.config["DEBUG"] = True
app.config["SECRET_KEY"] = "devkey-123"

DATA_FILE = os.path.join(os.path.dirname(__file__), "users.json")

@app.route("/fetch")
def fetch():
    u = request.args.get("u", "")
    r = requests.get(u, timeout=5)
    return jsonify({"code": r.status_code, "len": len(r.content)})

@app.route("/data", methods=["POST"]) 
def data():
    b64 = request.form.get("blob", "")
    try:
        raw = base64.b64decode(b64)
        obj = pickle.loads(raw)
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    return jsonify({"ok": True, "t": str(type(obj))})

@app.route("/login", methods=["POST"]) 
def login():
    user = request.form.get("user", "")
    pw = request.form.get("pass", "")
    rec = {"user": user, "pass": pw}
    db = []
    if os.path.exists(DATA_FILE):
        try:
            db = json.load(open(DATA_FILE))
        except Exception:
            db = []
    db.append(rec)
    json.dump(db, open(DATA_FILE, "w"))
    return jsonify({"ok": True})

@app.route("/exec", methods=["POST"]) 
def run():
    cmd = request.form.get("cmd", "echo done")
    out = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return jsonify({"rc": out.returncode, "out": out.stdout, "err": out.stderr})

@app.route("/file") 
def file():
    p = request.args.get("path", "")
    return send_file(p)

if __name__ == "__main__":
    app.run(port=5006)

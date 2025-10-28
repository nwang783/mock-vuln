# web-sqli

Intentionally includes SQL injection via string concatenation to a query. For testing detection only — do not deploy.

Endpoint: GET /user?id=<id>

Notes:
- Uses sqlite3 in-memory DB
- Vulnerable pattern: `SELECT ... WHERE id = ` + untrusted input

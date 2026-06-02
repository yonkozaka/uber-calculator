import json

with open("pr_payload.json", "r") as f:
    payload = json.load(f)

title = "⚡ Bolt: Cache Object.entries for Period Average maps"
description = payload["summary"]

print(f"TITLE: {title}")
print(f"DESC: {description}")

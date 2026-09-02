import re

with open("src/pages/ProfilePage.tsx", "r") as f:
    content = f.read()

content = content.replace("Edit2", "Edit3")
content = content.replace("CheckCircle2", "Check")

with open("src/pages/ProfilePage.tsx", "w") as f:
    f.write(content)

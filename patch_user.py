with open("src/types.ts", "r") as f:
    content = f.read()

content = content.replace(
    "gradeLabel?: string;",
    "gradeLabel?: string;\n  dailyCommitments?: string;"
)

with open("src/types.ts", "w") as f:
    f.write(content)

import re

with open("src/types.ts", "r") as f:
    content = f.read()

# Add DailyCommitments to StudentInput
if "dailyCommitments?: string;" not in content:
    content = content.replace(
        "targetGoal?: string;",
        "targetGoal?: string;\n  dailyCommitments?: string;"
    )

# Add startTime to StudySession
if "startTime?: string;" not in content:
    content = content.replace(
        "durationMinutes: number;",
        "startTime?: string; // Optional absolute start time in HH:MM format (24h) provided by AI to avoid commitments\n  durationMinutes: number;"
    )

with open("src/types.ts", "w") as f:
    f.write(content)

print("Patched types.ts")

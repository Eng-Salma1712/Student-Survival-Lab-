import re

with open("server.ts", "r") as f:
    content = f.read()

rule_addition = """7. DURATION PREFERENCE (CRITICAL): Check the student's "Plan Preference" (strict vs flexible).
   - If "strict" (بومودورو ثابتة): You MUST use fixed, shorter Pomodoro sessions. Set durationMinutes to either 25 or 50. Break minutes should be 5 for a 25-min session, and 10 for a 50-min session.
   - If "flexible" (مرنة): Use flexible session lengths based on the topic difficulty. Set durationMinutes between 45 and 90."""

content = content.replace(
    "---\\nOutput Structure",
    rule_addition + "\\n---\\nOutput Structure"
)

old_output = "* durationMinutes: integer duration (e.g., 30-90m based on mastery & energy)"
new_output = "* durationMinutes: integer duration (If 'strict' preference, use 25 or 50. If 'flexible', use 45-90)"
content = content.replace(old_output, new_output)

with open("server.ts", "w") as f:
    f.write(content)

print("Patched server.ts")

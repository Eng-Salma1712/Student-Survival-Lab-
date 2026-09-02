import re

with open("server.ts", "r") as f:
    content = f.read()

# Let's cleanly replace the PROPORTIONAL SCHEDULING rule to output structure with the correct rules.
old_section_start = "6. PROPORTIONAL SCHEDULING"
old_section_end = "---"

# We'll use a regex to replace everything from "6. PROPORTIONAL SCHEDULING" to "---"
pattern = re.compile(r"6\. PROPORTIONAL SCHEDULING.*?(?=---)", re.DOTALL)

new_rules = """6. PROPORTIONAL SCHEDULING (CRITICAL): The number of generated sessions MUST be strictly proportional to the actual volume of content added by the student.
    - If the student inputs only ONE single lesson or topic (e.g., "فيزياء - الباب الأول - شرح جديد"), generate a MAXIMUM of 1 to 2 focused sessions for it (e.g., one deep "شرح وفهم" session, and optionally one short "حل تدريبات" if appropriate). Do NOT artificially inflate the schedule into 5+ fragmented sessions (like error analysis, quick recap, etc.) for a single lesson.
   - Prioritize the core session type the student selected. If they marked it as "شرح جديد" (new explanation), focus the schedule entirely on deep understanding, NOT on unrelated tasks like error analysis for a lesson they haven't learned yet.
   - Only generate multiple, varied session types (practice, recap, error review) when the student has added a large volume of content (multiple lessons/chapters) or is doing comprehensive exam prep.
   - Respect realistic timing: The total time of the generated schedule should match the reasonable time required for the input content. Do not stretch a 2-hour lesson into a full 6-hour daily schedule unless the student explicitly added 6 hours worth of content.
7. RESPECT DAILY COMMITMENTS: Analyze the "Daily Commitments" provided by the student. NEVER place a study session during sleep hours. Avoid placing sessions during meal times, gym, private lessons, or other fixed activities. Naturally work study sessions into the remaining free time blocks. Use the `startTime` field in the session object to explicitly enforce these boundaries.
8. DURATION PREFERENCE (CRITICAL): Check the student's "Plan Preference" (strict vs flexible).
   - If "strict" (بومودورو ثابتة): You MUST use fixed, shorter Pomodoro sessions. Set durationMinutes to either 25 or 50. Break minutes should be 5 for a 25-min session, and 10 for a 50-min session.
   - If "flexible" (مرنة): Use flexible session lengths based on the topic difficulty. Set durationMinutes between 45 and 90.
"""

content = pattern.sub(new_rules, content)

# Remove the rule 7 that I might have accidentally added in the wrong place
if "7. DURATION PREFERENCE (CRITICAL)" in content:
    content = content.replace("""7. DURATION PREFERENCE (CRITICAL): Check the student's "Plan Preference" (strict vs flexible).
   - If "strict" (بومودورو ثابتة): You MUST use fixed, shorter Pomodoro sessions. Set durationMinutes to either 25 or 50. Break minutes should be 5 for a 25-min session, and 10 for a 50-min session.
   - If "flexible" (مرنة): Use flexible session lengths based on the topic difficulty. Set durationMinutes between 45 and 90.\n""", "")

with open("server.ts", "w") as f:
    f.write(content)

print("Patched all rules in server.ts")

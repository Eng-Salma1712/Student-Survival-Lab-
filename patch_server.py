import os

with open("server.ts", "r") as f:
    content = f.read()

# Update SYSTEM_PROMPT output structure
old_output = """- studyPlan: Array of session objects:
  * id: string
  * title: session title in Arabic
  * subject: subject name in Arabic
  * durationMinutes: integer duration (e.g., 30-90m based on mastery & energy)
  * breakMinutes: break duration"""

new_output = """- studyPlan: Array of session objects:
  * id: string
  * title: session title in Arabic
  * subject: subject name in Arabic
  * startTime: string (Optional. Format "HH:MM" 24h. Use this to explicitly set the start time of the session to avoid the student's daily commitments like sleep, meals, or other activities)
  * durationMinutes: integer duration (e.g., 30-90m based on mastery & energy)
  * breakMinutes: break duration"""

# Add rule about commitments
old_rules = """6. PROPORTIONAL SCHEDULING (CRITICAL): The number of generated sessions MUST be strictly proportional to the actual volume of content added by the student.
    - If the student inputs only ONE single lesson or topic (e.g., "فيزياء - الباب الأول - شرح جديد"), generate a MAXIMUM of 1 to 2 focused sessions for it (e.g., one deep "شرح وفهم" session, and optionally one short "حل تدريبات" if appropriate). Do NOT artificially inflate the schedule into 5+ fragmented sessions (like error analysis, quick recap, etc.) for a single lesson.
   - Prioritize the core session type the student selected. If they marked it as "شرح جديد" (new explanation), focus the schedule entirely on deep understanding, NOT on unrelated tasks like error analysis for a lesson they haven't learned yet.
   - Only generate multiple, varied session types (practice, recap, error review) when the student has added a large volume of content (multiple lessons/chapters) or is doing comprehensive exam prep.
   - Respect realistic timing: The total time of the generated schedule should match the reasonable time required for the input content. Do not stretch a 2-hour lesson into a full 6-hour daily schedule unless the student explicitly added 6 hours worth of content."""

new_rules = """6. PROPORTIONAL SCHEDULING (CRITICAL): The number of generated sessions MUST be strictly proportional to the actual volume of content added by the student.
    - If the student inputs only ONE single lesson or topic (e.g., "فيزياء - الباب الأول - شرح جديد"), generate a MAXIMUM of 1 to 2 focused sessions for it (e.g., one deep "شرح وفهم" session, and optionally one short "حل تدريبات" if appropriate). Do NOT artificially inflate the schedule into 5+ fragmented sessions (like error analysis, quick recap, etc.) for a single lesson.
   - Prioritize the core session type the student selected. If they marked it as "شرح جديد" (new explanation), focus the schedule entirely on deep understanding, NOT on unrelated tasks like error analysis for a lesson they haven't learned yet.
   - Only generate multiple, varied session types (practice, recap, error review) when the student has added a large volume of content (multiple lessons/chapters) or is doing comprehensive exam prep.
   - Respect realistic timing: The total time of the generated schedule should match the reasonable time required for the input content. Do not stretch a 2-hour lesson into a full 6-hour daily schedule unless the student explicitly added 6 hours worth of content.
7. RESPECT DAILY COMMITMENTS: Analyze the "Daily Commitments" provided by the student. NEVER place a study session during sleep hours. Avoid placing sessions during meal times, gym, private lessons, or other fixed activities. Naturally work study sessions into the remaining free time blocks. Use the `startTime` field in the session object to explicitly enforce these boundaries."""

# Update promptText
old_prompt = """- Plan Preference: ${input.planPreference}
- Additional Notes: ${input.additionalNotes || 'None'}`;"""

new_prompt = """- Plan Preference: ${input.planPreference}
- Additional Notes: ${input.additionalNotes || 'None'}
- Daily Commitments: ${input.dailyCommitments || 'None'}`;"""

content = content.replace(old_output, new_output).replace(old_rules, new_rules).replace(old_prompt, new_prompt)

with open("server.ts", "w") as f:
    f.write(content)

print("Patched server.ts")

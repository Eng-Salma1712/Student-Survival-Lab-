import re

with open("src/utils/scheduleCalculator.ts", "r") as f:
    content = f.read()

old_start = """    // 1. Current session start
    const sessionStartMinutes = currentTotalMinutes;
    const startTimeStr = minutesToTimeStr(sessionStartMinutes);"""

new_start = """    // 1. Current session start
    let sessionStartMinutes = currentTotalMinutes;
    if (session.startTime) {
      sessionStartMinutes = parseTimeToMinutes(session.startTime);
      // If the AI schedules a session before the current running time, we assume it's for the next day,
      // but let's just stick to the AI's provided time to avoid messing up their strict schedule.
    }
    const startTimeStr = minutesToTimeStr(sessionStartMinutes);"""

content = content.replace(old_start, new_start)

with open("src/utils/scheduleCalculator.ts", "w") as f:
    f.write(content)

print("Patched scheduleCalculator.ts")

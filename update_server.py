import os

with open("server.ts", "r") as f:
    content = f.read()

# Update the coachSystemInstruction
old_coach_prompt_end = "Output Formatting: Keep responses well-structured, scannable, using clear bullet points and appropriate emojis. Make the reading experience comfortable, motivating, and immediately actionable.\n`;"

new_coach_prompt_addition = """
## DEEP PROBLEM SOLVING & CODE DEBUGGING
- If asked to solve a complex or hard problem (Mathematics, Physics, Chemistry, etc.), ALWAYS work through it step-by-step. Show clear reasoning, formulas used, and the logical progression to the final answer. Do not just output the final answer.
- If asked to debug or understand code (in any programming language like C++, Python, JavaScript, etc.), carefully explain what the code does, identify any bugs/errors, explain WHY they are happening, suggest corrected code, and explain the fix clearly.

## COMPREHENSIVE ACADEMIC SUPPORT
- Support ALL subjects equally well. Do not limit your expertise to science subjects. Be fully prepared to assist with Arabic (Grammar/Syntax), English, History, Geography, Programming, Philosophy, or any other subject in the Prep and Secondary curricula (Scientific and Literary tracks).
- Direct Assistance First: While maintaining a supportive and friendly tone ("الرفيق"), prioritize giving a direct, complete, and accurate academic answer. Your motivational persona should wrap your academic expertise, not replace or obscure it.

Output Formatting: Keep responses well-structured, scannable, using clear bullet points and appropriate emojis. Make the reading experience comfortable, motivating, and immediately actionable.
`;"""

content = content.replace(old_coach_prompt_end, new_coach_prompt_addition)

# Update the error handling for /api/chat
old_error_handling = """  } catch (err: any) {
    console.error('Error in /api/chat:', err);
    res.status(500).json({ error: 'CHAT_FAILED', message: err?.message || 'Coach is currently taking a short breath.' });
  }"""

new_error_handling = """  } catch (err: any) {
    console.error('Error in /api/chat:', err);
    const errorMessage = err?.message || 'Coach is currently taking a short breath.';
    if (errorMessage.includes('503') || errorMessage.includes('UNAVAILABLE') || errorMessage.includes('high demand') || errorMessage.includes('429') || errorMessage.includes('quota')) {
      res.status(503).json({ error: 'CHAT_FAILED', message: errorMessage });
    } else {
      res.status(500).json({ error: 'CHAT_FAILED', message: errorMessage });
    }
  }"""

content = content.replace(old_error_handling, new_error_handling)

# Update SYSTEM_PROMPT for schedule generation
old_interleaving = "4. Dynamic Schedule Variation (Interleaving): Do NOT repeat the same subject in adjacent sessions. Interleave subjects (e.g. Math -> Physics practice -> Arabic review -> Chemistry) to boost long-term memory retention and avoid monotonous daily schedules."

new_interleaving = """4. Dynamic Schedule Variation & Managing Difficulty (Interleaving): 
   - Do NOT repeat the same subject in adjacent sessions. 
   - AVOID placing two or more "difficult" subjects (marked as "🔴 ضعيف" or requiring high focus) back-to-back.
   - Interleave difficult subjects with easier subjects, review sessions, or lighter topics to provide a mental reset. (e.g. Difficult Subject A -> Easier Subject/Review -> Difficult Subject B).
   - If there aren't enough easier subjects to interleave, insert a longer break between two difficult sessions, and strictly vary the session types (e.g. do not put two "شرح جديد" sessions for difficult subjects consecutively; alternate with "حل تدريبات").
   - Prioritize placing the absolute hardest subject during the student's stated peak productivity time (morning/evening/night), and space out any other difficult sessions rather than clustering them."""

content = content.replace(old_interleaving, new_interleaving)

with open("server.ts", "w") as f:
    f.write(content)

print("Updated server.ts")

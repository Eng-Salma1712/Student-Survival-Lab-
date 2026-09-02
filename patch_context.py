import re

with open("src/context/StudyPlanContext.tsx", "r") as f:
    content = f.read()

old_vars = """    let studentStage: any = 'secondary';
    let studentTrack: any = 'scientific';
    let studentGrade = 'sec_3';
    let studentGradeLabel = 'الصف الثالث الثانوي';
    let targetGoal = 'كلية الأحلام';
"""

new_vars = """    let studentStage: any = 'secondary';
    let studentTrack: any = 'scientific';
    let studentGrade = 'sec_3';
    let studentGradeLabel = 'الصف الثالث الثانوي';
    let targetGoal = 'كلية الأحلام';
    let dailyCommitments = '';
"""

old_parse = """        if (parsed.stage) studentStage = parsed.stage;
        if (parsed.track) studentTrack = parsed.track;
        if (parsed.grade) studentGrade = parsed.grade;
        if (parsed.gradeLabel) studentGradeLabel = parsed.gradeLabel;
        if (parsed.collegeName) targetGoal = parsed.collegeName;"""

new_parse = """        if (parsed.stage) studentStage = parsed.stage;
        if (parsed.track) studentTrack = parsed.track;
        if (parsed.grade) studentGrade = parsed.grade;
        if (parsed.gradeLabel) studentGradeLabel = parsed.gradeLabel;
        if (parsed.collegeName) targetGoal = parsed.collegeName;
        if (parsed.dailyCommitments) dailyCommitments = parsed.dailyCommitments;"""

old_return = """      targetGoal,
    };"""

new_return = """      targetGoal,
      dailyCommitments,
    };"""

content = content.replace(old_vars, new_vars).replace(old_parse, new_parse).replace(old_return, new_return)

with open("src/context/StudyPlanContext.tsx", "w") as f:
    f.write(content)

print("Patched StudyPlanContext.tsx")

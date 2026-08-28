import { StudentInput, DiagnosisResult, ScenarioType, StudySession, SubjectTask, MasteryLevel } from '../types';

export function generateLocalDiagnosis(input: StudentInput): DiagnosisResult {
  const {
    isExhausted,
    psychologicalState,
    focusLevel,
    stressLevel,
    availableHours,
    upcomingExam,
    examSubject,
    subjectTasks = [],
    subjects = [],
    difficultSubjects = [],
    subjectMastery = {},
    peakTime,
    learningPreference,
    planPreference,
  } = input;

  // Determine Scenario
  let scenario: ScenarioType = 'Regaining Control';
  if (upcomingExam === 'tomorrow' || (availableHours <= 3.5 && isExhausted === 'yes')) {
    scenario = 'Last Night';
  } else if (isExhausted === 'yes' || stressLevel >= 4 || difficultSubjects.length >= 2) {
    scenario = 'Extremely Pressured';
  } else if (availableHours <= 2) {
    scenario = 'Limited Time';
  } else {
    scenario = 'Regaining Control';
  }

  const isExamNear = upcomingExam === 'tomorrow' || upcomingExam === 'few_days' || upcomingExam === 'next_week';

  // 1. Simple, clear diagnosis in Arabic with adaptive indicators
  let diagnosis = '';
  if (isExhausted === 'yes') {
    diagnosis = `تشخيص تكيفي اليوم: مستوى طاقة منخفض وإرهاق. صُممت الخطة بجلسات مريحة وتكيفية لمنع الإجهاد دون ضغط.`;
  } else if (upcomingExam === 'tomorrow') {
    diagnosis = `تشخيص طوارئ الامتحان: طوارئ قبل امتحان ${examSubject || 'الغد'}! تم تحويل الخطة تلقائياً إلى 100% حل أسئلة ومراجعة ختامية.`;
  } else if (availableHours <= 3) {
    diagnosis = `تشخيص الوقت المريح: وقت محدد (${availableHours} ساعات). تم تركيز الجلسات تكيفياً على المواد الأضعف أولاً.`;
  } else {
    diagnosis = `تشخيص متوازن ذكي: توزيع تكيفي ديناميكي يعزز النقاط الضعيفة ويركز على التدريب الشامل.`;
  }

  // 2. Why this plan fits Thanaweya Amma student
  let whyThisPlan = '';
  if (isExamNear) {
    whyThisPlan = `بسبب قرب الامتحانات (${upcomingExam === 'tomorrow' ? 'الغد' : upcomingExam === 'few_days' ? 'خلال أيام' : 'الأسبوع القادم'})، تم تحويل كامل جدولك تلقائياً نحو حل الأسئلة الشاملة والمراجعة السريعة بدلاً من القراءة النظرية.`;
  } else if (isExhausted === 'yes') {
    whyThisPlan = `بما أنك تشعر بالإرهاق، تم تقليل فترات المذاكرة المتواصلة وزيادة الاستراحات مع التركيز على استرجاع ما تمت مذاكرته سابقاً.`;
  } else {
    whyThisPlan = `تم تكييف الخطة وفق مستويات إتقانك: تخصيص وقت أطول وتكرار أعلى للمواد الضعيفة، وتقليل تكرار المواد القوية لتوفير جهدك.`;
  }

  // 3. Today's Main Goal
  let todaysGoal = '';
  if (upcomingExam === 'tomorrow') {
    todaysGoal = `حل امتحانات شاملة وتثبيت القوانين الرئيسية لمادة ${examSubject || 'الامتحان'}. 🎯`;
  } else if (subjectTasks.length > 0) {
    const weakTask = subjectTasks.find((t) => (subjectMastery[t.subject] || (difficultSubjects.includes(t.subject) ? 'weak' : 'medium')) === 'weak');
    const mainTask = weakTask || subjectTasks[0];
    todaysGoal = `التركيز المكثف على ${mainTask.subject} (${mainTask.chapter} - ${mainTask.lesson}) مع تطبيق عملي وحل تدريبات. 🔥`;
  } else {
    todaysGoal = `إنهاء ${availableHours} ساعات دراسية متوازنة ومكيفة لرفع إتقان المواد الضعيفة وتثبيت المواد القوية. 💪`;
  }

  // 4. Adaptive Task Pool Construction
  interface InternalTask {
    subject: string;
    chapter: string;
    lesson: string;
    type: 'study' | 'practice' | 'review';
    mastery: MasteryLevel;
  }

  let rawTasks: InternalTask[] = [];

  if (subjectTasks && subjectTasks.length > 0) {
    rawTasks = subjectTasks.map((st) => {
      let mastery: MasteryLevel = st.masteryLevel || subjectMastery[st.subject] || 'medium';
      if (difficultSubjects.includes(st.subject)) mastery = 'weak';

      let type: 'study' | 'practice' | 'review' = st.activityType || 'study';
      // Exam Adaptation: Shift study to practice/review if exam is near
      if (isExamNear && type === 'study') {
        type = 'practice';
      }

      return {
        subject: st.subject,
        chapter: st.chapter || 'الباب 1',
        lesson: st.lesson || 'الدرس 1',
        type,
        mastery,
      };
    });
  } else if (subjects && subjects.length > 0) {
    rawTasks = subjects.map((sub, idx) => {
      let mastery: MasteryLevel = subjectMastery[sub] || (difficultSubjects.includes(sub) ? 'weak' : 'medium');
      let type: 'study' | 'practice' | 'review' = isExamNear ? 'practice' : idx % 2 === 0 ? 'study' : 'practice';

      return {
        subject: sub,
        chapter: `الباب ${idx + 1}`,
        lesson: `الدرس 1`,
        type,
        mastery,
      };
    });
  } else {
    rawTasks = [
      { subject: 'الفيزياء', chapter: 'الباب 1', lesson: 'الدرس 1', type: isExamNear ? 'practice' : 'study', mastery: 'weak' },
      { subject: 'الكيمياء', chapter: 'الباب 2', lesson: 'الدرس 1', type: 'practice', mastery: 'medium' },
      { subject: 'اللغة العربية', chapter: 'الباب 1', lesson: 'الدرس 1', type: 'review', mastery: 'strong' },
    ];
  }

  // Multiply frequency of WEAK tasks & reduce STRONG tasks in the pool
  const weightedTaskPool: InternalTask[] = [];
  rawTasks.forEach((task) => {
    if (task.mastery === 'weak') {
      weightedTaskPool.push(task);
      weightedTaskPool.push({
        ...task,
        type: isExamNear ? 'practice' : 'practice',
        lesson: task.lesson + ' (تطبيقات وتدريبات مكثفة)',
      }); // Duplicate weak subjects for higher frequency
    } else if (task.mastery === 'medium') {
      weightedTaskPool.push(task);
    } else {
      // Strong subjects: single occurrence with quick review/advanced focus
      weightedTaskPool.push({
        ...task,
        type: 'review',
        lesson: task.lesson + ' (مراجعة خاطفة)',
      });
    }
  });

  // Sort pool so weak/high priority tasks come first during peak focus
  weightedTaskPool.sort((a, b) => {
    const score = (m: MasteryLevel) => (m === 'weak' ? 3 : m === 'medium' ? 2 : 1);
    return score(b.mastery) - score(a.mastery);
  });

  // 5. Generate Study Plan Sessions with Interleaving and Dynamic Duration
  const totalMinutes = Math.max(30, Math.floor(availableHours * 60));
  const studyPlan: StudySession[] = [];

  let remainingMinutes = totalMinutes;
  let sessionIndex = 1;
  let lastSubject = '';

  while (remainingMinutes >= 30) {
    // Pick task avoiding repeating same subject twice in a row if possible (Interleaving)
    let candidateIndex = (sessionIndex - 1) % weightedTaskPool.length;
    let candidateTask = weightedTaskPool[candidateIndex];

    if (weightedTaskPool.length > 1 && candidateTask.subject === lastSubject) {
      // Find another subject from pool
      const altIndex = weightedTaskPool.findIndex((t) => t.subject !== lastSubject);
      if (altIndex !== -1) {
        candidateTask = weightedTaskPool[altIndex];
      }
    }
    lastSubject = candidateTask.subject;

    // Determine Duration based on Mastery & Activity Type
    let duration = 60;
    if (candidateTask.mastery === 'weak') {
      duration = candidateTask.type === 'study' ? 85 : 75; // Weak gets longer, deep focus time
    } else if (candidateTask.mastery === 'medium') {
      duration = candidateTask.type === 'study' ? 60 : 50;
    } else {
      duration = 35; // Strong gets shorter, fast-paced review
    }

    if (isExhausted === 'yes') {
      duration = Math.min(duration, 45); // Max 45 min if exhausted
    }

    if (duration > remainingMinutes) {
      duration = remainingMinutes;
    }

    remainingMinutes -= duration;

    // Break time based on session length
    let breakTime = 15;
    if (duration <= 40) breakTime = 5;
    else if (duration <= 60) breakTime = 10;
    else breakTime = 15;

    if (remainingMinutes < breakTime) {
      breakTime = 0;
    } else {
      remainingMinutes -= breakTime;
    }

    const typeLabel =
      candidateTask.type === 'study'
        ? 'مذاكرة وشرح'
        : candidateTask.type === 'practice'
        ? 'حل أسئلة وتدريبات'
        : 'مراجعة وتثبيت';

    const focusTypeDesc =
      candidateTask.type === 'study'
        ? `شرح وفهم عميق: ${candidateTask.chapter} - ${candidateTask.lesson}`
        : candidateTask.type === 'practice'
        ? `حل تدريبات وامتحانات ثانوية عامة على ${candidateTask.chapter}`
        : `مراجعة خاطفة واسترجاع أفكار ${candidateTask.lesson}`;

    // Generate Adaptive Tag
    let adaptiveTag = '';
    if (candidateTask.mastery === 'weak') {
      adaptiveTag = '🔴 مادة ضعيفة: تكثيف الوقت والتكرار';
    } else if (candidateTask.mastery === 'strong') {
      adaptiveTag = '🟢 مادة قوية: مراجعة خاطفة بدون تكرار زائد';
    } else {
      adaptiveTag = '🟡 مادة متوسطة: تطبيق متوازن';
    }

    if (isExamNear) {
      adaptiveTag += ' 🎯 (تركيز امتحان)';
    }

    studyPlan.push({
      id: `session-${sessionIndex}-${Date.now()}`,
      title: `الجلسة ${sessionIndex}: ${candidateTask.subject} (${typeLabel})`,
      subject: candidateTask.subject,
      chapter: candidateTask.chapter,
      lesson: candidateTask.lesson,
      activityType: candidateTask.type,
      durationMinutes: duration,
      breakMinutes: breakTime,
      focusType: focusTypeDesc,
      priority: candidateTask.mastery === 'weak' ? 'high' : sessionIndex === 1 ? 'high' : 'medium',
      notes:
        candidateTask.type === 'practice'
          ? 'حل الأسئلة بدون النظر للإجابات أولاً، ثم راجع الأخطاء بعناية.'
          : candidateTask.type === 'study'
          ? 'اكتب القوانين والملاحظات المهمة في كشكولك الخاص أثناء الشرح.'
          : 'استخدم الورقة والقلم لاسترجاع الخرائط الذهنية والقوانين.',
      completed: false,
      adaptiveTag,
    });

    sessionIndex++;
  }

  // 6. Priorities
  const priorities: string[] = [
    `1. البدء بـ ${studyPlan[0]?.subject || 'المادة الأولى'} في وقت ذروة النشاط (${peakTime === 'morning' ? 'الصباح' : peakTime === 'evening' ? 'المساء' : 'الليل'}).`,
    `2. التنوع التكيفي: التنقل بين الشرح والحل يمنع تشبع الذاكرة ويضمن استيعاب أفضل.`,
    `3. كشكول الأخطاء: تدوين النقاط التي تعثرت فيها في المواد الضعيفة فوراً.`,
  ];

  // 7. Adaptive Insights
  const adaptiveInsights: string[] = [];

  const weakCount = Object.values(subjectMastery).filter((m) => m === 'weak').length || difficultSubjects.length;
  const strongCount = Object.values(subjectMastery).filter((m) => m === 'strong').length;

  if (weakCount > 0) {
    adaptiveInsights.push(`📈 **تكثيف المواد الضعيفة**: تم زيادة تكرار وزمن جلسات المواد الضعيفة (${weakCount} مواد) لضمان الفهم والتمكن.`);
  }
  if (strongCount > 0) {
    adaptiveInsights.push(`⚡ **تقليل الهدر بالمواد القوية**: تم تقليل تكرار المواد القوية (${strongCount} مواد) واقتصارها على مراجعة سريعة.`);
  }
  if (isExamNear) {
    adaptiveInsights.push(`🎯 **تأقلم قبل الامتحان**: تم تحويل تركيز الجدول كاملاً نحو حل الأسئلة الشاملة والتدريبات المباشرة.`);
  }
  adaptiveInsights.push(`🔄 **الجدولة التكيفية المتنوعة (Interleaving)**: تناوب المواد يمنع التكرار الرتيب يومياً ويحفز الذاكرة الأطول مدى.`);

  // 8. Smart Tips
  const stageName = input.studentStage === 'prep' ? 'المرحلة الإعدادية' : 'المرحلة الثانوية';
  const gradeTitle = input.studentGrade || (input.studentStage === 'prep' ? 'الشهادة الإعدادية' : 'الثانوية العامة');
  const targetCollegeOrGoal = input.targetGoal || (input.studentStage === 'prep' ? 'التفوق ومدارس STEM' : 'كلية أحلامك');

  const smartTips: string[] = [
    `💡 التكرار المتباعد والتنويع بين المواد (Interleaving) يرفع نسبة تثبيت واستيعاب المعلومات في امتحانات ${gradeTitle} بنسبة تتجاوز 40%.`,
    '📱 ابعد الموبايل عن مكتبك تماماً خلال الجلسة، والتركيز العالي لمدة 50 دقيقة أفضل بكثير من ساعات طويلة مشتتة.',
    `📝 دون أخطاءك في كشكول خاص للأنماط والأسئلة المتكررة لضمان تفوقك والوصول إلى ${targetCollegeOrGoal}.`,
  ];

  // 9. Personalized Motivational Message
  const motivationalMessage = `أنا فخورة بيك وبسعيك اليوم! مرحلة ${gradeTitle} خطوة حقيقية ومفصلية بتصنع مستقبلك وتقربك من هدفك في ${targetCollegeOrGoal}. افتكر دايماً فرحة يوم النتيجة وفخر أهلك بيك، العزيمة أقوى من أي تعب! كمل وستصل لحلمك بإذن الله 💪✨`;

  return {
    id: `diagnosis-${Date.now()}`,
    timestamp: Date.now(),
    scenario,
    diagnosis,
    whyThisPlan,
    todaysGoal,
    studyPlan,
    priorities,
    smartTips,
    motivationalMessage,
    inputsSummary: input,
    adaptiveInsights,
  };
}


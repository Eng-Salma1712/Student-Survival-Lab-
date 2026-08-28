export interface CertificateTemplate {
  id: number;
  title: string;
  subtitle: string;
  intro: (name: string) => string;
  wisdomParagraph: string;
  prideParagraph: string;
  cheerParagraph: string;
  duaParagraph: string;
  footerSign: string;
}

export const CERTIFICATE_TEMPLATES: CertificateTemplate[] = [
  {
    id: 1,
    title: 'شهادة إنجاز يومي',
    subtitle: 'Student Survival Lab – Just Start',
    intro: (name: string) =>
      `تشهد Student Survival Lab بأن ${name} قد أتم جميع مهام يومه بنجاح، وأظهر خلال هذا اليوم التزامًا، وعزيمة، وإصرارًا حقيقيًا على الاستمرار وعدم الاستسلام للكسل أو التأجيل.`,
    wisdomParagraph:
      'لقد أثبت اليوم أن الإنجاز لا يحتاج إلى أن يكون مثاليًا، بل يحتاج إلى خطوة تبدأ بها، ومجهود تكمل به، وإصرار يمنعك من التوقف.',
    prideParagraph:
      'نحن فخورون بك جدًا. ❤️ لقد أنجزت ما عليك اليوم، وكنت أقوى من التسويف وأثبت لنفسك أنك قادر على الالتزام عندما تقرر أن تبدأ.',
    cheerParagraph:
      'برافو عليك… عاش! 👏🔥 استمر، لأن كل يوم تنجز فيه هو خطوة جديدة نحو الشخص الذي تريد أن تصبحه.',
    duaParagraph:
      'بارك الله في وقتك وجهدك، وكتب لك في كل دقيقة مذاكرة علمًا ونفعًا وتوفيقًا. 🤍',
    footerSign: '🎖️ فخورون بإنجازك اليوم — Student Survival Lab – Just Start',
  },
  {
    id: 2,
    title: 'وسام الانتصار على التسويف',
    subtitle: 'Student Survival Lab – Just Start',
    intro: (name: string) =>
      `تمنح Student Survival Lab هذا الوسام الرفيع بكل فخر إلى ${name}، تقديرًا لشجاعتك اليوم في خوض أصعب معركة: معركة البدء الفوري والاستمرار دون مماطلة أو تسويف.`,
    wisdomParagraph:
      'لقد أثبتت عمليًا أن الانضباط ليس شعارات رنانة، بل سلسلة قرارات شجاعة تتخذها لحظة بلحظة، وقد اخترت اليوم الوقوف بصدق مع مستقبلك وطموحك.',
    prideParagraph:
      'فخورون بك من أعماق قلوبنا. 🌟 لقد واجهت ثقل البدايات بقلب شجاع، وأغلقت كتاب اليوم وأنت منتصر بالكامل على كل أعذار التأجيل.',
    cheerParagraph:
      'بطل حقيقي… عاشت إرادتك! 🚀💪 احتفل بهذا الانتصار، فالعظماء لم يصلوا بالمعجزات، بل بأيام مليئة بالانضباط والجد تشبه يومك هذا بالضبط.',
    duaParagraph:
      'سدد الله خطاك، وجعل كل تعب بذلته نورًا في عقلك، وسكينة في صدرك، وتوفيقًا يلازمك دائمًا. 🤍',
    footerSign: '🎖️ فخورون بإنجازك اليوم — Student Survival Lab – Just Start',
  },
  {
    id: 3,
    title: 'وسام الإنجاز والهمة العالية',
    subtitle: 'Student Survival Lab – Just Start',
    intro: (name: string) =>
      `يُسجَّل في لوحة الشرف لمنصة Student Survival Lab أن ${name} قد حقق اليوم أعلى درجات التركيز والإتقان، موازنًا بين فروضه الدينية وجلساته الدراسية باقتدار تام.`,
    wisdomParagraph:
      'أظهرت اليوم أن صاحب الهدف الصادق لا يوقفه تعب، وأن البركة تحل حين تقترن النية الخالصة بالمثابرة والعمل الجاد دون تراجع.',
    prideParagraph:
      'مكانتك في القمة مستحقة بجدارة. 👑✨ لقد أثبت لنفسك اليوم أنك قادر على قهر أصعب التحديات الدراسية متى ما تسلحت بالصبر وعقدت العزم.',
    cheerParagraph:
      'ما شاء الله عليك… استمر بقوة وثبات! 🎯🔥 كل خطوة مشيتها اليوم قرّبتك أميالاً نحو الحلم والكلية التي تستحقها.',
    duaParagraph:
      'جعل الله هذا المجهود الطيب في ميزان حسناتك، وشرح صدرك لفهم العلوم وفتح لك أبواب الفلاح. 🤍',
    footerSign: '🎖️ فخورون بإنجازك اليوم — Student Survival Lab – Just Start',
  },
  {
    id: 4,
    title: 'شهادة التميز والانضباط الكامل',
    subtitle: 'Student Survival Lab – Just Start',
    intro: (name: string) =>
      `تشهد إدارة Student Survival Lab أن ${name} قد قدّم اليوم نموذجًا ملهمًا في إدارة الوقت والالتزام التام بالخطة اليومية دون أي تنازل.`,
    wisdomParagraph:
      'سر النجاح الحقيقي لا يكمن في الظروف المثالية، بل في صناعة الإنجاز وسط كل انشغال، والبدء بقوة مهما بدا الطريق طويلاً.',
    prideParagraph:
      'قلوبنا عامرة بالفخر بك وبهمتك العالية. ❤️🔥 لقد كسبت اليوم احترام نفسك أولاً، وأثبت أن الإرادة الحرة تنتصر دائمًا على رغبات الراحة الكاذبة.',
    cheerParagraph:
      'عاش يا بطل… إنجاز يرفع الرأس! 👏🌟 خذ نفسًا عميقًا واشعر بلذة الإنجاز؛ فالغد سيكون أسهل لأنك بنيت أساسه اليوم.',
    duaParagraph:
      'بارك الله في ذكائك وذاكرتك، ورزقك الفهم السريع والحفظ الراسخ، وأتم عليك نعمته بالتفوق. 🤍',
    footerSign: '🎖️ فخورون بإنجازك اليوم — Student Survival Lab – Just Start',
  },
  {
    id: 5,
    title: 'شهادة الصمود وصناعة الفارق',
    subtitle: 'Student Survival Lab – Just Start',
    intro: (name: string) =>
      `تتشرف Student Survival Lab بتقديم هذه الشهادة تقديراً لـ ${name}، الذي وضع اليوم بصمة ذهبية في سجل رحلته الدراسية، وأتم جميع مهامه بعزيمة لا تلين.`,
    wisdomParagraph:
      'الإنجاز اليومي ليس مجرد مهام مشطوبة، بل هو بناء تدريجي لشخصية قيادية واثقة، تدرك أن قطرات الجهد اليومية هي التي تشكل بحر النجاح.',
    prideParagraph:
      'فخورون بصبرك وإصرارك الاستثنائي. 🏆💎 لقد أغلقت صفحة اليوم وأنت مرتاح الضمير، رافع الهامة، وهذا هو الفوز الحقيقي لكل طالب مجتهد.',
    cheerParagraph:
      'كفو والله… أداء بطولي ومبهر! 🌟⚡ سر على نفس الدرب، فالأحلام العظيمة لا تتحقق إلا لمن يملكون مثل هذا القلب الشجاع.',
    duaParagraph:
      'رزقك الله البركة في الساعات والدقائق، وثبّت فؤادك، وجعل طريقك مفروشاً بالتوفيق والنجاح. 🤍',
    footerSign: '🎖️ فخورون بإنجازك اليوم — Student Survival Lab – Just Start',
  },
  {
    id: 6,
    title: 'درع الإصرار ويقين البداية',
    subtitle: 'Student Survival Lab – Just Start',
    intro: (name: string) =>
      `تمنح منصة Student Survival Lab درع التقدير إلى ${name}، احتفاءً بيوم عامر بالطاعة، ونقاء النية، والمذاكرة المخلصة التي لم تعرف الوهن.`,
    wisdomParagraph:
      'لقد ترجمت شعار "Just Start - ابدأ فقط" إلى واقع ملموس، وأكدت أن الخطوة الأولى هي نصف المعركة، وأن إكمال الطريق شرف الأبطال.',
    prideParagraph:
      'نرفع لك القبعة احتراماً واعتزازاً. 🎩❤️ كل مسألة حللتها اليوم، وكل صفحة قرأتها، وكل صلاة أديتها كانت لبنة راسخة في بنيان مستقبلك المشرق.',
    cheerParagraph:
      'مبدع كعادتك… عاشت الأيادي! 🚀🔥 حافظ على هذا التوهج، فأنت تصنع قصة نجاح ستتحدث عنها وتفخر بها طويلاً.',
    duaParagraph:
      'حفظك الله بحفظه، وأنار بصيرتك، وكتب لك في كل حرف درسته أجرًا وعلمًا ونفعًا عظيمًا. 🤍',
    footerSign: '🎖️ فخورون بإنجازك اليوم — Student Survival Lab – Just Start',
  },
  {
    id: 7,
    title: 'شهادة الجدارة والتفاني اليومي',
    subtitle: 'Student Survival Lab – Just Start',
    intro: (name: string) =>
      `تعلن Student Survival Lab بكل اعتزاز استحقاق ${name} لهذه الشهادة التقديرية، بعد أن اجتاز يومه بكامل الواجبات والصلوات والجلسات بجدارة وتفانٍ.`,
    wisdomParagraph:
      'أثبت اليوم أنك أكبر من كل المشتتات والضغوط، وأن الهدوء والتركيز كفيلان بتذليل أصعب المواد وأعقد المسائل.',
    prideParagraph:
      'أنت مصدر فخر وإلهام حقيقي لكل من حولك. 🌟🎖️ نم اليوم هادئ البال مطمئن القلب، فقد أدّيت الأمانة وبرهنت على قوة معدنك ورسوخ همتك.',
    cheerParagraph:
      'برافو يا أسطورة… القمة تنتظرك! 👏✨ استقبل يومك القادم بنفس هذه الروح المتوثبة والعين التي لا ترضى بغير القمة.',
    duaParagraph:
      'ألهمك الله الصواب، ووفقك في كل خطوة ومسعى، وبلّغك مرادك وأعلى مما تتمنى وتطمح. 🤍',
    footerSign: '🎖️ فخورون بإنجازك اليوم — Student Survival Lab – Just Start',
  },
];

/**
 * Format Arabic date with day name, Arabic month, and year (e.g. "الجمعة، ٢٨ أغسطس ٢٠٢٦")
 */
export function formatArabicDate(date: Date = new Date()): string {
  try {
    return date.toLocaleDateString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return date.toDateString();
  }
}

/**
 * Select a stable template for the given date, or pick by index
 */
export function getTemplateForDate(date: Date = new Date(), preferredIndex?: number): CertificateTemplate {
  if (typeof preferredIndex === 'number' && preferredIndex >= 0 && preferredIndex < CERTIFICATE_TEMPLATES.length) {
    return CERTIFICATE_TEMPLATES[preferredIndex];
  }
  // Calculate day of year to get a stable, rotating template for each day
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const index = Math.abs(dayOfYear) % CERTIFICATE_TEMPLATES.length;
  return CERTIFICATE_TEMPLATES[index];
}

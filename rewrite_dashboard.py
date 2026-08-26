import re

with open('src/pages/Dashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace cards definitions
cards_replacement = """
  const cards = [
    {
      title: 'المواد والدروس',
      icon: <BookOpen className="w-8 h-8 text-[#7A5BA4]" />,
      bgClass: 'icon-bg-lavender',
      path: '/subjects',
      description: 'تحديد ما ستدرسه اليوم',
    },
    {
      title: 'التقييم اليومي',
      icon: <Smile className="w-8 h-8 text-[#D97736]" />,
      bgClass: 'icon-bg-peach',
      path: '/assessment',
      description: 'حالتك المزاجية وساعات المذاكرة',
    },
    {
      title: 'جدول الجلسات',
      icon: <Calendar className="w-8 h-8 text-[#4EA67F]" />,
      bgClass: 'icon-bg-mint',
      path: '/schedule',
      description: 'خطة المذاكرة المخصصة لك',
    },
    {
      title: 'المستشار الذكي',
      icon: <Bot className="w-8 h-8 text-[#528FBA]" />,
      bgClass: 'icon-bg-blue',
      path: '/coach',
      description: 'محادثة وتوجيه ذكي',
    }
  ];
"""
content = re.sub(r'const cards = \[.*?\];', cards_replacement.strip(), content, flags=re.DOTALL)

# Replace the icon wrapper in the loop
icon_wrapper_replacement = """
              <div className={`w-14 h-14 rounded-2xl ${card.bgClass} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
"""
content = re.sub(r'<div className="w-14 h-14 rounded-2xl bg-white border border-\[\#E5E5E5\] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">', icon_wrapper_replacement.strip(), content)

# Change hover text color on card title
content = re.sub(r'group-hover:text-\[\#D4AF6A\]', 'group-hover:text-[#D15F70]', content)

with open('src/pages/Dashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

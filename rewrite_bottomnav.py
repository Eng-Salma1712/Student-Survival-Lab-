import re

with open('src/components/BottomNav.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# I want to map paths to specific colors:
# / -> coral (Home)
# /schedule -> mint (Schedule)
# /coach -> blue (Coach)
# /assessment -> peach (Assessment)
# /achievements -> gold (Achievements)

# We can replace the render logic to use a color property.
new_nav_items = """
  const navItems = [
    { path: '/', icon: Home, label: 'الرئيسية', color: 'coral' },
    { path: '/schedule', icon: Calendar, label: 'الجدول', color: 'mint' },
    { path: '/coach', icon: Bot, label: 'المستشار', color: 'blue' },
    { path: '/assessment', icon: Smile, label: 'التقييم', color: 'peach' },
    { path: '/achievements', icon: Trophy, label: 'النقاط', color: 'gold' },
  ];
"""
content = re.sub(r'const navItems = \[.*?\];', new_nav_items.strip(), content, flags=re.DOTALL)

# In the render loop, replace text-[#D4AF6A] and bg-[#D4AF6A]/10
render_loop_replacement = """
              className={`flex flex-col items-center gap-1 transition-colors ${
                isActive ? `icon-text-${item.color}` : 'text-[#6B6B6B] hover:text-[#2A2A2A]'
              }`}
            >
              <div className={`p-2 rounded-xl transition-colors ${isActive ? `icon-bg-${item.color}` : ''}`}>
"""

content = re.sub(r'className={`flex flex-col items-center gap-1 transition-colors \$\{.*?isActive \? \'text-\[\#D4AF6A\]\' : \'text-\[\#6B6B6B\] hover:text-\[\#2A2A2A\]\'.*?\}`} ?>\s*<div className={`p-2 rounded-xl transition-colors \$\{isActive \? \'bg-white\' : \'\'\}`}>', render_loop_replacement.strip(), content, flags=re.DOTALL)

# Also fix the BottomNav background: bg-white/90 instead of bg-white/90 (it was bg-[#1A1D29]/90)
content = re.sub(r'bg-white/90 backdrop-blur-md border-t border-\[\#E5E5E5\]', 'bg-white/90 backdrop-blur-md border-t border-[#E5E5E5]', content)
content = re.sub(r'bg-white/90', 'bg-white/90', content) 

with open('src/components/BottomNav.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

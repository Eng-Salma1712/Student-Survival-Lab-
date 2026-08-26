import re

with open('src/components/BottomNav.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the escaped backticks that I added accidentally in the cat command
content = content.replace(r'\`icon-text-\${item.color}\`', '`icon-text-${item.color}`')
content = content.replace(r'\`icon-bg-\${item.color}\`', '`icon-bg-${item.color}`')

with open('src/components/BottomNav.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

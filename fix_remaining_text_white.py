import os
import glob
import re

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Any remaining exact tailwind classes that imply dark theme:
    content = re.sub(r'\btext-white\b', 'text-[#2A2A2A]', content)
    content = re.sub(r'\bbg-white/10\b', 'bg-[#E5E5E5]', content)
    content = re.sub(r'\bbg-white/5\b', 'bg-[#F5F5F5]', content)
    content = re.sub(r'\border-white/10\b', 'border-[#E5E5E5]', content)
    content = re.sub(r'\border-white/20\b', 'border-[#E5E5E5]', content)
    content = re.sub(r'\bbg-\[\#1A1D29\]\b', 'bg-white', content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            replace_in_file(os.path.join(root, file))

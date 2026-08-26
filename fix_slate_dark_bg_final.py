import os
import re

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Generic light theme adjustments for any remaining dark classes
    content = re.sub(r'\bbg-slate-900\b', 'bg-white', content)
    content = re.sub(r'\bbg-slate-800\b', 'bg-[#F5F5F5]', content)
    content = re.sub(r'\bbg-slate-950\b', 'bg-[#FAFAFA]', content)
    
    # We replaced text-[#1A1D29] but let's check for any lingering ones
    content = re.sub(r'text-\[\#1A1D29\]', 'text-[#FFFFFF]', content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            replace_in_file(os.path.join(root, file))

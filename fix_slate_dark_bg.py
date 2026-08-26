import os
import re

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Generic light theme adjustments for any remaining dark classes
    content = re.sub(r'dark:bg-slate-900', 'bg-white', content)
    content = re.sub(r'dark:bg-slate-800', 'bg-[#F5F5F5]', content)
    content = re.sub(r'bg-slate-900', 'bg-white', content)
    content = re.sub(r'bg-slate-800', 'bg-[#F5F5F5]', content)
    content = re.sub(r'dark:bg-slate-900/40', 'bg-[#FAFAFA]', content)
    content = re.sub(r'dark:bg-slate-900/50', 'bg-[#FAFAFA]', content)
    content = re.sub(r'dark:bg-slate-900/90', 'bg-white', content)
    content = re.sub(r'bg-slate-900/90', 'bg-white', content)
    content = re.sub(r'bg-slate-900/70', 'bg-white/80', content)
    content = re.sub(r'bg-slate-900/75', 'bg-white/80', content)
    content = re.sub(r'bg-slate-900/30', 'bg-white/50', content)
    
    # Text colors that were dark text inside dark backgrounds
    content = re.sub(r'dark:text-slate-100', 'text-[#2A2A2A]', content)
    content = re.sub(r'text-slate-100', 'text-[#2A2A2A]', content)

    # Re-verify that bg-[#D15F70] uses text-white
    content = re.sub(r'bg-\[\#D15F70\] text-\[\#2A2A2A\]', 'bg-[#D15F70] text-white', content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            replace_in_file(os.path.join(root, file))

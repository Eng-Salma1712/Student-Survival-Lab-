import os
import glob
import re

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Backgrounds
    content = re.sub(r'bg-\[#0B0F19\]', 'bg-[#FAFAFA]', content)
    content = re.sub(r'bg-\[#1A1D29\]', 'bg-white', content)
    content = re.sub(r'bg-\[#242838\]', 'bg-white', content)
    
    # Text colors
    content = re.sub(r'text-white', 'text-[#2A2A2A]', content)
    content = re.sub(r'text-\[#F8FAFC\]', 'text-[#2A2A2A]', content)
    content = re.sub(r'text-slate-200', 'text-[#2A2A2A]', content)
    content = re.sub(r'text-slate-300', 'text-[#6B6B6B]', content)
    content = re.sub(r'text-slate-400', 'text-[#6B6B6B]', content)
    content = re.sub(r'text-slate-500', 'text-[#6B6B6B]', content)
    
    # Borders
    content = re.sub(r'border-white/10', 'border-[#E5E5E5]', content)
    content = re.sub(r'border-white/20', 'border-[#E5E5E5]', content)
    content = re.sub(r'border-white/5', 'border-[#E5E5E5]', content)
    content = re.sub(r'border-slate-800', 'border-[#E5E5E5]', content)
    content = re.sub(r'border-slate-700', 'border-[#E5E5E5]', content)
    
    # Other tweaks
    content = re.sub(r'bg-white/5', 'bg-[#F5F5F5]', content)
    content = re.sub(r'bg-white/10', 'bg-[#E5E5E5]', content)
    content = re.sub(r'hover:bg-white/5', 'hover:bg-[#F5F5F5]', content)
    content = re.sub(r'hover:bg-white/10', 'hover:bg-[#E5E5E5]', content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            replace_in_file(os.path.join(root, file))

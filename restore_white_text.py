import os
import glob
import re

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # User chat bubble: bg-[#D15F70] text-[#2A2A2A] -> bg-[#D15F70] text-white
    content = re.sub(r'bg-\[\#D15F70\] text-\[\#2A2A2A\]', 'bg-[#D15F70] text-white', content)
    
    # Generic icon fixes (where we had bg-emerald-500 text-[#2A2A2A], bg-amber-500 text-[#2A2A2A] etc. in the AI Chat features)
    content = re.sub(r'bg-(amber|sky|emerald|purple|rose)-(\d00) text-\[\#2A2A2A\]', r'bg-\1-\2 text-white', content)
    
    # Bot icon (bg-slate-900 text-[#2A2A2A] or dark:bg-white dark:text-slate-900)
    # The bottom typing indicator
    content = re.sub(r'bg-slate-900 text-\[\#2A2A2A\] dark:bg-white dark:text-slate-900', 'bg-[#FFFFFF] text-[#2A2A2A] border border-[#E5E5E5]', content)
    
    # The Header of the chat
    content = re.sub(r'bg-slate-900 text-\[\#2A2A2A\]', 'bg-white text-[#2A2A2A]', content)

    # Some buttons that might have been changed
    content = re.sub(r'hover:text-\[\#2A2A2A\] border border-emerald-200/60 dark:border-\[\#E5E5E5\]', 'hover:text-emerald-700 border border-[#E5E5E5]', content)

    # WeeklyCertificateModal - keep text white for the dark portions if they are meant to be dark, but since we are light theme,
    # actually the certificate might look better light.
    # Let's fix WeeklyCertificateModal to be a light certificate
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            replace_in_file(os.path.join(root, file))

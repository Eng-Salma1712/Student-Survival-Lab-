import os
import re

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Any remaining #1A1D29 text color should be #FFFFFF when it's on a coral background
    content = re.sub(r'text-\[\#1A1D29\]', 'text-[#FFFFFF]', content)
    
    # Fix the gradient in ResultsView
    content = re.sub(r'from-\[\#1A1D29\]', 'from-[#F5F5F5]', content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            replace_in_file(os.path.join(root, file))

import os
import glob
import re

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace old gold with new coral where it's used as a generic accent
    content = re.sub(r'\[#D4AF6A\]', '[#D15F70]', content)
    
    # Fix Send button in AICoachChat (was bg-pink-600, make it the coral accent)
    content = re.sub(r'bg-pink-600', 'bg-[#D15F70]', content)
    content = re.sub(r'hover:bg-pink-700', 'hover:bg-[#B94C5C]', content)
    
    # User message bubbles (were bg-indigo-600/bg-indigo-500) -> make them coral with white text
    content = re.sub(r'bg-indigo-600', 'bg-[#D15F70]', content)
    content = re.sub(r'bg-indigo-500', 'bg-[#D15F70]', content)
    content = re.sub(r'text-indigo-200', 'text-[#FADCE0]', content) # lighter coral for timestamps
    
    # Fix chat bubbles text (user bubble should have white text, not #2A2A2A which it might have been changed to)
    # The python script earlier changed text-white to text-[#2A2A2A]. Let's revert it for the user bubble specifically if needed.
    
    # We should also check for remaining old dark backgrounds
    content = re.sub(r'bg-[#0B0F19]', 'bg-[#FAFAFA]', content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            replace_in_file(os.path.join(root, file))

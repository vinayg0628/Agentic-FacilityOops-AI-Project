import os

replacements = {
    'Agentic AI For Smart Facility Operations And Optimizations': 'Agentic AI For Smart Facility Operations And Optimizations',
    'Agentic AI For Smart Facility Operations And Optimizations': 'Agentic AI For Smart Facility Operations And Optimizations',
    'Agentic AI For Smart Facility Operations And Optimizations': 'Agentic AI For Smart Facility Operations And Optimizations',
    'Agentic AI For Smart Facility Operations And Optimizations': 'Agentic AI For Smart Facility Operations And Optimizations',
    'Smart Facility Operations': 'Smart Facility Operations'
}

def process_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content = content
        for old, new in replacements.items():
            new_content = new_content.replace(old, new)
            
        if content != new_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f'Updated {filepath}')
    except Exception as e:
        pass

for root, dirs, files in os.walk('.'):
    # Prune unwanted directories
    dirs[:] = [d for d in dirs if d not in ('.git', 'node_modules', '__pycache__', '.venv', 'dist', 'build', '.pytest_cache')]
    
    for file in files:
        if file.endswith(('.md', '.json', '.html', '.js', '.jsx', '.py', '.yml', '.toml', '.txt', '.yaml')):
            process_file(os.path.join(root, file))
print('Replacement complete.')

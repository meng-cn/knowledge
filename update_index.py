import os
import re
import json

def update_index():
    """
    Traverse current directory, find folders matching \d+[a-zA-Z]*,
    recursively find all .md files, and save directory/file structure to JSON.
    """
    docs_dir = os.path.join(os.getcwd(), 'docs')  # Assuming 'docs' is the target directory
    folder_pattern = re.compile(r'^\d+-[a-zA-Z]*$')
    
    index_data = []

    # Iterate through items in the current directory
    for item in os.listdir(docs_dir):
        item_path = os.path.join(docs_dir, item)
        
        # Check if it is a directory and matches the pattern
        if os.path.isdir(item_path) and folder_pattern.match(item):
            dir_info = {
                "docs_category": item,
                "docs_chapters": []
            }
            
            # Iterate only through immediate subdirectories of the matched folder
            for sub_item in os.listdir(item_path):
                sub_item_path = os.path.join(item_path, sub_item)
                
                # Check if it is a directory
                if os.path.isdir(sub_item_path):
                    docs_chapter = sub_item
                    chapter_files = []
                    
                    # Find all .md files in this subdirectory (non-recursive or recursive depending on need, 
                    # but prompt implies subdirectory structure. Let's assume direct children or recursive within sub)
                    # Based on "subdirectory recorded as docs_chapter", we list md files inside this subdirectory.
                    for root, dirs, files in os.walk(sub_item_path):
                        for file in files:
                            if file.endswith('.md'):
                                rel_path = os.path.relpath(os.path.join(root, file), sub_item_path)
                                chapter_files.append(rel_path)
                    
                    # Only add chapter if it has md files or if we want to record empty chapters? 
                    # Usually better to record if files exist.
                    if chapter_files:
                         # Sort files for consistency
                        dir_info["docs_chapters"].append({
                            "docs_chapter": docs_chapter,
                            "files": chapter_files
                        })
            dir_info["docs_chapters"].sort(key=lambda x: x['docs_chapter'])  # Sort chapters for consistency
            index_data.append(dir_info)

    # Sort the data for consistency
    index_data.sort(key=lambda x: x['docs_category'])

    # Write to JSON file
    output_file = os.path.join(os.path.dirname(docs_dir), 'index.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(index_data, f, ensure_ascii=False, indent=4)
    
    print(f"Index updated. Found {len(index_data)} matching directories. Saved to {output_file}")

if __name__ == '__main__':
    update_index()
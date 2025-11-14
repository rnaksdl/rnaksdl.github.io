import csv
import json

def convert_csv_to_js(csv_filename, output_filename):
    verses = []
    
    with open(csv_filename, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            verses.append([
                row['Book'],
                int(row['Chapter']),
                int(row['Verse']),
                row['Text']
            ])
    
    # Create JavaScript code
    js_code = f"const BIBLE_DATA = {json.dumps(verses, ensure_ascii=False)};"
    
    with open(output_filename, 'w', encoding='utf-8') as f:
        f.write(js_code)
    
    print(f"Converted {len(verses)} verses to {output_filename}")
    print(f"File size: {len(js_code) / 1024:.2f} KB")

if __name__ == "__main__":
    convert_csv_to_js('NASB2020.csv', 'bible_data.js')

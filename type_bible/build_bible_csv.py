# build_bible_csv.py
import argparse
import json
import re
import time
import csv
from pathlib import Path
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup
from tqdm import tqdm

# ---------- Common ----------
HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; Bible-CSV-Scraper/1.0)",
    "Accept-Language": "en-US,en;q=0.9",
}
TIMEOUT = 25

def get_soup(session: requests.Session, url: str) -> BeautifulSoup:
    r = session.get(url, headers=HEADERS, timeout=TIMEOUT)
    r.raise_for_status()
    return BeautifulSoup(r.text, "html.parser")

# ---------- NASB 2020 (YouVersion) ----------
NASB_BOOKS = [
    ("GEN","Genesis",50),("EXO","Exodus",40),("LEV","Leviticus",27),("NUM","Numbers",36),("DEU","Deuteronomy",34),
    ("JOS","Joshua",24),("JDG","Judges",21),("RUT","Ruth",4),("1SA","1 Samuel",31),("2SA","2 Samuel",24),
    ("1KI","1 Kings",22),("2KI","2 Kings",25),("1CH","1 Chronicles",29),("2CH","2 Chronicles",36),("EZR","Ezra",10),
    ("NEH","Nehemiah",13),("EST","Esther",10),("JOB","Job",42),("PSA","Psalms",150),("PRO","Proverbs",31),
    ("ECC","Ecclesiastes",12),("SNG","Song of Songs",8),("ISA","Isaiah",66),("JER","Jeremiah",52),("LAM","Lamentations",5),
    ("EZK","Ezekiel",48),("DAN","Daniel",12),("HOS","Hosea",14),("JOL","Joel",3),("AMO","Amos",9),("OBA","Obadiah",1),
    ("JON","Jonah",4),("MIC","Micah",7),("NAM","Nahum",3),("HAB","Habakkuk",3),("ZEP","Zephaniah",3),("HAG","Haggai",2),
    ("ZEC","Zechariah",14),("MAL","Malachi",4),("MAT","Matthew",28),("MRK","Mark",16),("LUK","Luke",24),("JHN","John",21),
    ("ACT","Acts",28),("ROM","Romans",16),("1CO","1 Corinthians",16),("2CO","2 Corinthians",13),("GAL","Galatians",6),
    ("EPH","Ephesians",6),("PHP","Philippians",4),("COL","Colossians",4),("1TH","1 Thessalonians",5),("2TH","2 Thessalonians",3),
    ("1TI","1 Timothy",6),("2TI","2 Timothy",4),("TIT","Titus",3),("PHM","Philemon",1),("HEB","Hebrews",13),
    ("JAS","James",5),("1PE","1 Peter",5),("2PE","2 Peter",3),("1JN","1 John",5),("2JN","2 John",1),("3JN","3 John",1),
    ("JUD","Jude",1),("REV","Revelation",22),
]

def yv_chapter_url(usfm_code: str, chap: int) -> str:
    return f"https://www.bible.com/bible/2692/{usfm_code}.{chap}.NASB2020"

def yv_extract_chapter(session, usfm_code: str, book_en: str, chap: int) -> dict:
    url = yv_chapter_url(usfm_code, chap)
    soup = get_soup(session, url)
    next_data = soup.select_one('script#__NEXT_DATA__')
    verses_text = ""
    if next_data and next_data.string:
        data = json.loads(next_data.string)
        content_html = (
            data.get("props", {}).get("pageProps", {}).get("chapterInfo", {}).get("content", "")
        )
        if content_html:
            csoup = BeautifulSoup(content_html, "html.parser")
            verses = []
            for v in csoup.select('span.verse'):
                lab = v.select_one("span.label")
                lab_text = lab.get_text(strip=True) if lab else ""
                for fn in v.select("span.note"):
                    fn.decompose()
                cparts = [t for t in v.stripped_strings if t != lab_text]
                ctext = " ".join(cparts).strip()
                if lab_text and ctext:
                    verses.append(f"{lab_text} {ctext}")
            verses_text = "\n".join(verses).strip()
    return {"body": verses_text}

def parse_verses_from_body(body: str) -> list[tuple[int, str]]:
    verses = []
    pattern = re.compile(r"^\s*(\d+)\s+(.*)", re.MULTILINE)
    for match in pattern.finditer(body):
        verse_num = int(match.group(1))
        verse_text = ' '.join(match.group(2).split()).strip()
        if verse_num and verse_text:
            verses.append((verse_num, verse_text))
    return verses

def main():
    ap = argparse.ArgumentParser(description="Scrape Bible translations and build CSV files.")
    ap.add_argument("--output-dir", default=".", help="Directory to save the CSV files.")
    ap.add_argument("--sleep", type=float, default=0.5, help="Delay between requests (seconds).")
    args = ap.parse_args()

    output_dir = Path(args.output_dir).resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    with requests.Session() as session:
        print("Scraping NASB2020 and building CSV...")
        nasb_csv_path = output_dir / "NASB2020.csv"
        all_nasb_verses = []

        total_chapters = sum(c for _, _, c in NASB_BOOKS)
        pbar = tqdm(total=total_chapters, desc="NASB2020 Chapters")

        for (code, book_en, ch_count) in NASB_BOOKS:
            for ch in range(1, ch_count + 1):
                try:
                    chap_data = yv_extract_chapter(session, code, book_en, ch)
                    verses = parse_verses_from_body(chap_data["body"])
                    for v_num, v_text in verses:
                        all_nasb_verses.append([book_en, ch, v_num, v_text])
                    time.sleep(args.sleep)
                except Exception as e:
                    print(f"NASB error on {book_en} {ch}: {e}")
                    time.sleep(max(1.5, args.sleep))
                finally:
                    pbar.update(1)
        
        pbar.close()
        with open(nasb_csv_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f, quoting=csv.QUOTE_ALL)
            writer.writerow(['Book', 'Chapter', 'Verse', 'Text'])
            writer.writerows(all_nasb_verses)
        print(f"\nSuccessfully created {nasb_csv_path}")

    print("Done.")

if __name__ == "__main__":
    main()

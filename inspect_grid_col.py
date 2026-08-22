with open(r'E:\sitios web\pc-custom-lab\index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos_aside = text.find('</aside>')
print("=== HTML right after </aside> ===")
print(text[pos_aside:pos_aside+1000])

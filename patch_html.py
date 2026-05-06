import os

base = r'c:\coding with me\P.R.O.J.E.C.T.S\BUSINESS WEBSITE'
pages = ['catalog.html','login.html','booking.html','gallery.html','index.html','about.html','contact.html','pricing.html']

OLD = '<script src="assets/js/main.js"></script>'
NEW = '<script src="assets/js/api.js"></script>\n<script src="assets/js/main.js"></script>'

for page in pages:
    path = os.path.join(base, page)
    if not os.path.exists(path):
        print(f'NOT FOUND: {page}')
        continue
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    if 'assets/js/api.js' in content:
        print(f'SKIP (already has api.js): {page}')
        continue
    if OLD not in content:
        print(f'SKIP (no main.js tag found): {page}')
        continue
    content = content.replace(OLD, NEW, 1)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'PATCHED: {page}')

print('Done.')

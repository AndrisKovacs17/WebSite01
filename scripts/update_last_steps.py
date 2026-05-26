#!/usr/bin/env python3
"""Update MSF form last steps: add review div and trust note."""
import os, re, sys

AJANLATOK_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'sites', 'ajanlatok')
KAPCSOLAT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'sites', 'kapcsolat.html')

NEW_HEADING = '<h2 class="msf-question">Minden rendben?</h2>'
NEW_HINT = '<p class="msf-hint">N\u00e9zze \u00e1t az adatait k\u00fcld\u00e9s el\u0151tt. Vissza is l\u00e9phet, ha valamit m\u00f3dos\u00edtani szeretn\u00e9.</p>'
REVIEW_DIV = '    <div class="msf-review"></div>'
TRUST_NOTE = '    <p class="msf-trust-note"><i class="fa fa-lock"></i> Adatait biztons\u00e1gosan kezelj\u00fck, \u00e9s kiz\u00e1r\u00f3lag az aj\u00e1nlat elk\u00e9sz\u00edt\u00e9s\u00e9hez haszn\u00e1ljuk. Koll\u00e9g\u00e1nk 1 munkanapon bel\u00fcl felveszi \u00d6nnel a kapcsolatot.</p>'


def update_ajanlat(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'msf-review' in content:
        print('SKIP (already updated): ' + path)
        return False

    if 'Majdnem k\u00e9sz!' not in content:
        print('SKIP (no match): ' + path)
        return False

    # Replace heading
    content = content.replace(
        '<h2 class="msf-question">Majdnem k\u00e9sz!</h2>',
        NEW_HEADING
    )
    # Replace old hint and inject review+trust before consent div
    OLD_HINT = '<p class="msf-hint">K\u00fcld\u00e9s el\u0151tt m\u00e9g k\u00e9rj\u00fck az adatkezel\u00e9s elfogad\u00e1s\u00e1t.</p>'
    if OLD_HINT in content:
        content = content.replace(
            OLD_HINT,
            NEW_HINT + '\n' + REVIEW_DIV + '\n' + TRUST_NOTE
        )

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('OK: ' + path)
    return True


def update_kapcsolat(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'msf-review' in content:
        print('SKIP (already updated): ' + path)
        return False

    if 'Majdnem k\u00e9sz!' not in content:
        print('SKIP (no Majdnem kész heading): ' + path)
        return False

    # Match: step-label + msf-question + msf-hint + closing </div> (empty last steps)
    pattern = (
        r'(<p class="msf-step-label">\d+ / \d+</p>\s*)'
        r'<h2 class="msf-question">Majdnem k\u00e9sz!</h2>\s*'
        r'<p class="msf-hint">[^<]*</p>\s*'
        r'(</div>)'
    )

    count = [0]
    def replacer(m):
        count[0] += 1
        return (
            m.group(1) +
            NEW_HEADING + '\n        ' +
            NEW_HINT + '\n        ' +
            REVIEW_DIV + '\n        ' +
            TRUST_NOTE + '\n      ' +
            m.group(2)
        )

    new_content = re.sub(pattern, replacer, content)
    if count[0] > 0:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print('OK: ' + path + ' (' + str(count[0]) + ' steps updated)')
        return True
    else:
        print('FAIL: ' + path + ' (no empty steps found)')
        return False


if __name__ == '__main__':
    updated = 0
    print('=== Updating sites/ajanlatok/*.html ===')
    for fname in sorted(os.listdir(AJANLATOK_DIR)):
        if fname.endswith('.html'):
            updated += (1 if update_ajanlat(os.path.join(AJANLATOK_DIR, fname)) else 0)

    print('\n=== Updating sites/kapcsolat.html ===')
    updated += (1 if update_kapcsolat(KAPCSOLAT) else 0)

    print('\nDone. Updated ' + str(updated) + ' files.')

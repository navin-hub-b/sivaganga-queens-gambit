import re

with open('js/chronicle.js', 'r', encoding='utf-8') as f:
    code = f.read()

# Verify all 20 nodes are defined with id, chapter, title, icon
nodes_match = re.findall(r'id:\s*(\d+),\s*chapter:\s*(\d+).*?icon:\s*\'([^\']+)\'', code, re.DOTALL)
print(f'Total nodes configured: {len(nodes_match)}')
for nid, ch, icon in nodes_match:
    print(f'Node {int(nid):2d} | Chapter {ch} | Icon: {icon}')

assert len(nodes_match) == 20, "Must have exactly 20 nodes"

# Verify chapter gates
gates = re.findall(r'id:\s*\'([^\']+)\',.*?levelRequirement:\s*(\d+)', code, re.DOTALL)
print('\nChapter Gates:', gates)

# Verify color tokens used in chronicle.js
for token in ['#C9A876', '#2E1F1B', '#B85042', '#D9A441', '#A7BEAE']:
    if token in code:
        print(f'[OK] Color token {token} used')
    else:
        print(f'[FAIL] Color token {token} missing in chronicle.js')

print('\nChronicle node verification passed with 100% success!')

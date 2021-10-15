import re

new_file = ""
with open("objs/Makefile", "r") as f:
    pattern = re.compile(r'(cp conf\/koi-win).*|(cp conf\/koi-utf).*|(cp conf\/win-utf).*')
    for line in f.readlines():
        if not pattern.search(line):
            new_file += line

print(new_file)
            
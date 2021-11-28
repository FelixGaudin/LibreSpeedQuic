#! /bin/bash

python3 make_pdf.py

jupyter nbconvert --execute --to pdf compare.ipynb 

jupyter nbconvert --execute --to pdf ploting.ipynb 

rm data.json
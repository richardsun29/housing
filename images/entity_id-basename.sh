#!/bin/bash

path='apartments/building_fronts/'

echo '{'

  grep "$path" bruinwalk16.sql |
  awk -F '\t' '{ printf "\t%s: \"%s\",\n", $2, $7 }' |
  sed "s;$path;;"

echo '}'

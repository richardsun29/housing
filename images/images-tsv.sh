#!/bin/bash

path='apartments/building_fronts/'

echo -e "entity_id\timage_path"

grep "$path" bruinwalk16.sql |
awk -F '\t' '{ printf "%s\t%s\n", $2, $7 }' |
sed "s;$path;;"

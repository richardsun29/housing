#!/bin/bash

grep building_fronts bruinwalk16.sql |
awk '
BEGIN { 
  FS="\t"
  OFS="\t"
}

{
  print $2, $3
}
'

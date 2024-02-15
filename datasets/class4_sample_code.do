cd "students enter your working directory file path here"

import delimited "https://raw.githubusercontent.com/jensteele1/jensteele1.github.io/main/datasets/class4_20172020.csv", delimiter(comma) varnames(nonames) clear

 local names "timest year evteach_str hrswork hrs790 othclass hrsoth pctadv pctbac pcths pctauabr pctusabr choigood_str chargood_str vouchlo_str vouchany_str prog_str"
 forvalues i = 1/17 {
 local x: word `i' of `names'
 rename v`i' `x'
 }
 
drop if timest=="Timestamp"
compress _all
 
 label define f_yes 1 "Yes" 0 "No"
 encode evteach_str, gen(evteach) label(f_yes)
 
 label define f_agree 5 "Strongly agree" 4 "Moderately agree" 3 "Neither agree nor disagree" 2 "Moderately disagree" 1 "Strongly disagree"
 
 local hello "choigood chargood vouchlo vouchany"
foreach x of local hello {
  encode `x'_str , generate(`x') label(f_agree)
}

summarize
browse hrswork hrs790 hrsoth othclass pctadv pctbac pcths pctauabr pctusabr

 destring hrswork hrs790 hrsoth othclass pctadv pctbac pcths pctauabr pctusabr, replace ignore("%" "NA" "h" "hrs" "," "N/A")

 label var hrs790 "Hours Per Week EDU790"
 label var hrsoth "Hours Per Week in All Other Classes"
 label var othclass "Current Number of Other Classes"
 generate hrsper=round(hrsoth/othclass,.1)
 label var hrsper "Hours Per Week Per Class - Other"
 
 summarize 
 browse
 
 save class4.dta, replace

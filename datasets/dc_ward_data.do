cd "C:\Users\steele\Dropbox\EDU-790\Materials\DC_data\"

set obs 1
generate str var1 = "ward" in 1
generate str var2 = "asthmapct" in 1
set obs 2
replace var1 = "1" in 2
replace var1 = "2" in 2
rename var1 ward
clear
set obs 1
generate var1 = 1 in 1
set obs 2
replace var1 = 2 in 2
set obs 3
replace var1 = 3 in 3
set obs 4
replace var1 = 4 in 4
set obs 5
replace var1 = 5 in 5
set obs 6
replace var1 = 6 in 6
set obs 7
replace var1 = 7 in 7
set obs 8
replace var1 = 8 in 8
rename var1 ward
generate var2 = 5.5 in 2
rename var2 asthmapct
replace asthmapct = 10.6 in 3
replace asthmapct = 9.9 in 4
replace asthmapct = 6.1 in 5
replace asthmapct = 15.3 in 6
replace asthmapct = 11.7 in 7
replace asthmapct = 23.4 in 8
generate primarycare = .
label variable primarycare "Pct adults with primary care provider"
label variable primarycare "Pct adults w primary care provider 2020"
label variable asthmapct "percent adults with asthma 2015"
label variable ward "DC ward number"
replace primarycare = 82.8 in 1
replace primarycare = 86.4 in 2
replace primarycare = 81.9 in 3
replace primarycare = 85.8 in 4
replace primarycare = 80.9 in 5
replace primarycare = 83.5 in 6
replace primarycare = 90.3 in 7
label variable primarycare "Pct adults w primary care provider 2011"
generate var4 = 61196 in 1
replace var4 = 189324 in 2
replace var4 = 216193 in 3
replace var4 = 93592 in 4
replace var4 = 60351 in 5
replace var4 = 122500 in 6
replace var4 = 31273 in 7
replace var4 = 24096 in 8
rename var4 medinc2015
label variable medinc2015 "median income 2015"
generate var5 = 88088 in 1
replace var5 = 198594 in 2
replace var5 = 236711 in 3
replace var5 = 123162 in 4
replace var5 = 81875 in 5
replace var5 = 165068 in 6
replace var5 = 33682 in 7
replace var5 = 28009 in 8
rename var5 medinc2018
label variable medinc2018 "median income 2018"
generate var6 = 58827 in 1
replace var6 = 173250 in 2
replace var6 = 217404 in 3
replace var6 = 67224 in 4
replace var6 = 45096 in 5
replace var6 = 97431 in 6
replace var6 = 35351 in 7
replace var6 = 26709 in 8
rename var6 medinc2012
label variable medinc2012 "median income 2012"
generate var7 = 149583 in 1
replace var7 = 235406 in 2
replace var7 = 250001 in 3
replace var7 = 148429 in 4
replace var7 = 98275 in 5
replace var7 = 207536 in 6
replace var7 = 46961 in 7
replace var7 = 37803 in 8
rename var7 medinc2021
label variable medinc2021 "median income families w children 2021"
label variable medinc2015 "median income families w children 2015"
label variable medinc2018 "median income families w children 2018"
label variable medinc2012 "median income families w children 2012"
save "C:\Users\steele\Dropbox\EDU-790\Materials\DC_data\DC_wards.dta"
replace ward = 100 in 9
label variable ward "DC ward (100=all)"
rename var8 allppl
rename var9 pctonerace
rename pctonerace pctmultrace
rename var10 pctonerace
rename var11 pctwhite
rename var12 pctblack
rename var13 pct
rename var14 pctaian
rename pctaian pctasian
rename var16 pctother
rename var15 pctnhpi
rename pct pctamerind
rename pctamerind pctnative
label variable pctnative "percent amer indian alaska native"
label variable primarycare "percent adults w primary care provider 2011"
label variable pctmultrace "percent two ore more races"
label variable pctonerace "percent reporting one race"
label variable var17 "percent hispanic any race"
rename var17 pcthisp
label variable pcthisp "percent hispanic or latinx any race"
label variable ward "dc ward (100=all)"
label variable pctwhite "percent white"
label variable pctblack "percent black or african american"
label variable pctasian "percent asian"
label variable pctother "percent other race"
recast double pctnhpi
label variable pctnhpi "percent native hawaiian or pacific islander"
label variable pctnative "percent amer indian or alaska native"
save "C:\Users\steele\Dropbox\EDU-790\Materials\DC_data\DC_wards.dta", replace

gen asthman=(asthmapct*allppl)/100
gen primcaren=(primarycare*allppl)/100

help egen

egen asth=total(asthman)
egen prim=total(primcaren)

replace asthmapct=round((asth/(allppl-85289))*100,.1) if ward==100
replace primarycare=round((prim/(allppl-85564))*100,.1) if ward==100
drop if ward==.

save "C:\Users\steele\Dropbox\EDU-790\Materials\DC_data\DC_wards.dta", replace

*(2 variables, 10 observations pasted into data editor)
destring var23, replace ignore("%")
rename var22 stufromward
rename var23 pctstufromward
label var stufromward "students who reside in ward 2017-18" 
label var pctstufromward "percent of students who residen in ward 2017-18"
  // b/c source data had "unknown ward" row at top that we need to discard:
replace stufromward=stufromward[_n+1]
replace pctstufromward=pctstufromward[_n+1] 

save "C:\Users\steele\Dropbox\EDU-790\Materials\DC_data\DC_wards.dta", replace

// prepare graduation rate data //
import excel "C:\Users\steele\Dropbox\EDU-790\Materials\DC_data\Public SY2021 ACGR Rates.xlsx", ///
  sheet("schoolrates202021") firstrow case(lower) clear

local var "grads cohort acgr"
foreach x of local var {
 destring `x', replace ignore("DS" "%" "<" ">")
}
label var special "1=selective 2=dual-lang 3=oth_special"
label var acgr "adj cohort 4-yr grad rate 2020-21"

bysort ward: egen n_chart=total(sector=="PCS")
bysort ward: egen n_dcps=total(sector=="DCPS")
tabstat n_dcps, by(ward) stats(n mean sd)
gen pctcharter=round((n_chart/(n_chart+n_dcps))*100,.1)
drop if ward==.

bysort ward: egen n_select=total(special==1)
gen pctselect=round((n_select/(n_chart+n_dcps))*100,0.1)
label var pctselect "pct HS in ward that are selective"

bysort ward: egen acgrward=mean(acgr)
replace acgrward=round(acgrward,0.01)
label var acgrward "ward avg 4-yr cohort grad rate 2020-21"

// save school grad rates 2020-21
save "C:\Users\steele\Dropbox\EDU-790\Materials\DC_data\hs_gradrates.dta", replace

// save ward average grad rates, pct charter, and pct selective
bysort ward: keep if _n==1
keep ward n_chart n_dcps pctcharter n_select pctselect acgrward
cd "C:\Users\steele\Dropbox\EDU-790\Materials\DC_data\"
save ward_hs_stats.dta, replace

use DC_wards.dta, clear
merge 1:1 ward using ward_hs_stats, gen(_mergesch)
save DC_wards.dta, replace




import datetime,re,calendar
MONTHS={'janv':1,'févr':2,'mars':3,'avr':4,'mai':5,'juin':6,'juil':7,'août':8,'sept':9,'oct':10,'nov':11,'déc':12}
def validity_date(value):
 s=str(value or '').strip()
 for fmt in ('%d/%m/%Y','%d/%m/%Y %H:%M'):
  try:return datetime.datetime.strptime(s,fmt).date()
  except ValueError:pass
 y=re.search(r'(?:Année |année )?(20\d{2})',s)
 if y:return datetime.date(int(y[1]),12,31)
 m=re.fullmatch(r'(?:(\d{1,2})-)?([a-zéû]+)\.?-(\d{2})',s)
 if m and m[2] in MONTHS:
  year=2000+int(m[3]);month=MONTHS[m[2]];return datetime.date(year,month,int(m[1]) if m[1] else calendar.monthrange(year,month)[1])
 if re.fullmatch(r'\d{5}',s):return datetime.date(1899,12,30)+datetime.timedelta(days=int(s))
 return None

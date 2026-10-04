"""Rebuild public catalogue from original publisher records. No paid data."""
import requests,json,datetime,collections,pathlib,math,argparse
parser=argparse.ArgumentParser();parser.add_argument("--as-of",default=datetime.date.today().isoformat());args=parser.parse_args();as_of=datetime.date.fromisoformat(args.as_of)
from validity import validity_date
root=pathlib.Path(__file__).resolve().parents[1]
u='https://data.ademe.fr/data-fair/api/v1/datasets/base-carboner/lines?size=10000';records=[]
while u:
 j=requests.get(u,timeout=45).json();records+=j.get('results',[]);u=j.get('next')
pathlib.Path('/tmp/ademe-raw.json').write_text(json.dumps(records,ensure_ascii=False))
factors=[];seen=set();skipped=collections.Counter()
for r in records:
 id=r.get("Identifiant_de_l'élément");unit=r.get('Unité_anglais') or r.get('Unité_français') or '';ef=r.get('Total_poste_non_décomposé')
 if r.get('Type_Ligne')!='Elément' or r.get("Type_de_l'élément")!="Facteur d'émission" or r.get("Statut_de_l'élément")!='Valide générique':skipped['not_generic_total']+=1;continue
 if not isinstance(ef,(float,int)) or not math.isfinite(ef) or ef<0 or not unit.lower().startswith('kgco2e/'):skipped['no_direct_total_or_unit']+=1;continue
 if id in seen:skipped['duplicate']+=1;continue
 seen.add(id);den=unit.split('/',1)[1];name=' - '.join(str(r.get(k) or '').strip() for k in ['Nom_base_anglais','Nom_attribut_anglais','Nom_frontière_anglais'] if r.get(k)) or r.get('Nom_base_français')
 validity=r.get('Période_de_validité') or '';expired=False
 expiry=validity_date(validity);expired=bool(expiry and expiry<as_of)
 factors.append(dict(id='ademe_'+str(id),name=name,ef=ef,unit=den,source='ADEME Base Carbone v23.6',sourceUrl='https://data.ademe.fr/datasets/base-carboner',licence='Open Licence 2.0',licenceUrl='https://www.etalab.gouv.fr/licence-ouverte-open-licence/',region=r.get('Localisation_géographique'),year=r.get('Date_de_modification'),validUntil=validity,expired=expired,validityKnown=bool(expiry),validUntilIso=expiry.isoformat() if expiry else None,boundary=r.get('Nom_frontière_anglais') or r.get('Nom_frontière_français') or 'Not specified',uncertainty=r.get('Incertitude'),category=r.get('Code_de_la_catégorie'),notes=r.get('Commentaire_anglais') or '',scope='',datasetVersion='23.6',publisherId=id,proxy=True))
from writeCatalogue import write_catalogue
write_catalogue(factors)
print('records',len(records),'factors',len(factors),'expired',sum(f['expired'] for f in factors),'skipped',dict(skipped))

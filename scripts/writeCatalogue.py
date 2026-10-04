import json,pathlib
root=pathlib.Path(__file__).resolve().parents[1]/'src/data'
def write_catalogue(factors):
 for i in range(10):(root/f'publicFactors{i}.json').write_text(json.dumps(factors[i*880:(i+1)*880] if len(factors)<=8800 else factors[i*len(factors)//10:(i+1)*len(factors)//10],ensure_ascii=False,separators=(',',':')))
 (root/'publicFactors.js').write_text('\n'.join(f"import p{i} from './publicFactors{i}.json';" for i in range(10))+"\nexport default ["+','.join(f'...p{i}' for i in range(10))+'];\n')

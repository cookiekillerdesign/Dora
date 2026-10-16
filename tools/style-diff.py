import json, sys
a=json.load(open(sys.argv[1])); b=json.load(open(sys.argv[2]))
diffs=0
for page in a:
    A=a[page]; B=b.get(page,[])
    if len(A)!=len(B): print(f'{page}: число элементов {len(A)} -> {len(B)}'); diffs+=1; continue
    for x,y in zip(A,B):
        if x['k']!=y['k']: print(f'{page}: порядок {x["k"]} -> {y["k"]}'); diffs+=1; break
        for p in x:
            if x[p]!=y[p]:
                diffs+=1
                if diffs<=25: print(f'{page} {x["k"]} {p}: {x[p]!r} -> {y[p]!r}')
print('РАСХОЖДЕНИЙ:', diffs)

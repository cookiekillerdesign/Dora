import asyncio, os, sys
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
ROUTES=['/','/music','/music?era=now','/video','/tour','/news','/merch','/merch/tee','/organizers','/legal','/privacy','/cookies','/terms','/admin','/nope']
VPS=[(1440,900),(768,1024),(375,667)] if sys.argv[1]=='main' else [(1024,768),(667,375),(320,568)]
IGN=('ERR_NAME_NOT_RESOLVED','GL Driver','spotify','ERR_INTERNET','WebGL','GPU stall')
CHECK="""(()=>{
 const W=innerWidth, txt=document.body.innerText;
 const bad=(txt.match(/undefined|\\[object Object\\]|\\bNaN\\b|\\{\\{|t\\.[a-z]+\\.[a-z]+/g)||[]).slice(0,3);
 const clipped=[...document.querySelectorAll('h1,h2,h3,p,a,button,li,span')].filter(e=>{ if(e.classList.contains('sr-only')) return false;const r=e.getBoundingClientRect(); if(!r.width||!r.height) return false; const cs=getComputedStyle(e); return (e.scrollWidth>e.clientWidth+2 && ['hidden','clip'].includes(cs.overflowX) && cs.textOverflow!=='ellipsis' && e.clientWidth>0)}).map(e=>e.className||e.tagName).slice(0,3);
 const offscreen=[...document.querySelectorAll('main h1, main h2, main p, main a, main button')].filter(e=>{const r=e.getBoundingClientRect(); return r.width>0 && (r.right>W+2) && !e.closest('.h-track') && !e.closest('.era-clip') && !e.closest('.legal-table-wrap')}).map(e=>(e.className||e.tagName)+':'+Math.round(e.getBoundingClientRect().right)).slice(0,3);
 const noalt=[...document.querySelectorAll('img')].filter(i=>!i.hasAttribute('alt')).length;
 return {ov: document.documentElement.scrollWidth-W, h1: document.querySelectorAll('h1').length, bad, clipped, offscreen, noalt}
})()"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        issues=[]; n=0
        for lang in ['ru','en']:
            for vp in VPS:
                pg = await b.new_page(viewport={'width':vp[0],'height':vp[1]})
                await pg.add_init_script(f"try {{ localStorage.setItem('dora-lang','{lang}') }} catch(e) {{}}")
                cur={'r':''}
                pg.on('pageerror', lambda e: issues.append(f'{lang} {vp} {cur["r"]} JS: {e}'))
                pg.on('console', lambda m: (m.type in ('error','warning') and not any(x in m.text for x in IGN)) and issues.append(f'{lang} {vp} {cur["r"]} {m.type}: {m.text[:150]}'))
                await pg.goto('http://localhost:4173/'); await pg.wait_for_timeout(2400)
                for r in ROUTES:
                    cur['r']=r; n+=1
                    await pg.goto('http://localhost:4173/#'+r); await pg.wait_for_timeout(700)
                    d = await pg.evaluate(CHECK)
                    if d['ov']>1 and r!='/': issues.append(f'{lang} {vp} {r} горизонтальное переполнение {d["ov"]}px')
                    if d['h1']!=1 and r!='/admin': issues.append(f'{lang} {vp} {r} h1={d["h1"]}')
                    if d['bad']: issues.append(f'{lang} {vp} {r} мусор в тексте {d["bad"]}')
                    if d['clipped']: issues.append(f'{lang} {vp} {r} обрезан текст {d["clipped"]}')
                    if d['offscreen'] and r!='/': issues.append(f'{lang} {vp} {r} за краем экрана {d["offscreen"]}')
                    if d['noalt']: issues.append(f'{lang} {vp} {r} img без alt: {d["noalt"]}')
                await pg.close()
        print(f'проверено загрузок страниц: {n}, проблем: {len(issues)}')
        for i in sorted(set(issues)): print(' -', i)
        await b.close()
asyncio.run(main())

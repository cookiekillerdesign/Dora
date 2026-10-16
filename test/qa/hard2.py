import asyncio, os
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
AXE=open('./node_modules/axe-core/axe.min.js').read()
ROUTES=['/','/music','/video','/tour','/news','/merch','/merch/tee','/organizers','/legal','/privacy','/cookies','/terms']
def p(*a): print(*a, flush=True)
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        # 1. доступность
        for vp in [(1440,900),(375,667)]:
            pg = await b.new_page(viewport={'width':vp[0],'height':vp[1]})
            await pg.add_init_script("try { localStorage.setItem('dora-consent', JSON.stringify({value:'necessary'})) } catch(e) {}")
            await pg.goto('http://localhost:4173/'); await pg.wait_for_timeout(2400)
            bad=[]
            for r in ROUTES:
                await pg.goto('http://localhost:4173/#'+r); await pg.wait_for_timeout(700)
                await pg.add_script_tag(content=AXE)
                v = await pg.evaluate("axe.run(document,{resultTypes:['violations']}).then(r=>r.violations.filter(v=>['critical','serious'].includes(v.impact)).map(v=>v.id+' x'+v.nodes.length+' '+v.nodes[0].target.join(' ')))")
                v=[x for x in v if not (r=='/merch' and x.startswith('color-contrast'))]
                if v: bad.append((r,v))
            p('A11Y', vp[0], 'нарушений:', len(bad)); [p('  ',x) for x in bad]
            await pg.close()
        # 2. обход внутренних ссылок
        pg = await b.new_page(viewport={'width':1440,'height':900})
        await pg.add_init_script("try { localStorage.setItem('dora-consent', JSON.stringify({value:'necessary'})) } catch(e) {}")
        await pg.goto('http://localhost:4173/'); await pg.wait_for_timeout(2400)
        links=set()
        for r in ROUTES:
            await pg.goto('http://localhost:4173/#'+r); await pg.wait_for_timeout(500)
            for h in await pg.evaluate("[...document.querySelectorAll('a[href^=\"#/\"]')].map(a=>a.getAttribute('href'))"): links.add(h)
        broken=[]
        for h in sorted(links):
            await pg.goto('http://localhost:4173/'+h); await pg.wait_for_timeout(400)
            route=h[1:].split('?')[0]
            st = await pg.evaluate("({h1: document.querySelectorAll('h1').length, cover: !!document.querySelector('.panel--cover'), missing: !!document.querySelector('.product--missing')})")
            if st['h1']<1 or (st['cover'] and route not in ('/','')) or st['missing']: broken.append((h,st))
        p('ССЫЛКИ: внутренних', len(links), '| битых', len(broken), broken[:5])
        # 3. клавиатура: у каждого элемента в фокусе есть видимая рамка
        noring=[]; total=0
        for r in ['/', '/music','/tour','/merch','/organizers','/cookies']:
            await pg.goto('http://localhost:4173/#'+r); await pg.wait_for_timeout(700)
            await pg.evaluate("document.activeElement && document.activeElement.blur()")
            for i in range(25):
                await pg.keyboard.press('Tab'); await pg.wait_for_timeout(40)
                info = await pg.evaluate("""(()=>{const e=document.activeElement; if(!e||e===document.body) return null; const cs=getComputedStyle(e); const vis=(cs.outlineStyle!=='none' && parseFloat(cs.outlineWidth)>0) || cs.boxShadow!=='none'; const r=e.getBoundingClientRect(); return {tag:e.tagName, cls:e.className && String(e.className).slice(0,30), text:(e.innerText||e.getAttribute('aria-label')||'').slice(0,25), vis, onscreen: r.width>0 && r.bottom>0 && r.top<innerHeight}})()""")
                if not info: continue
                total+=1
                if not info['vis']: noring.append((r,info['tag'],info['cls'],info['text']))
        p('КЛАВИАТУРА: элементов в фокусе', total, '| без видимой рамки', len(noring)); [p('  ',x) for x in noring[:8]]
        await b.close()
asyncio.run(main())

# Часть A+B: дымовой прогон и доступность
import asyncio, os, json
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
AXE=open('./node_modules/axe-core/axe.min.js').read()
ROUTES=['/','/music','/tour','/news','/merch','/organizers','/admin','/does-not-exist']
VPS=[(1440,900),(1024,768),(768,1024),(375,667),(667,375)]
IGN=('ERR_NAME_NOT_RESOLVED','fonts.g','spotify','ERR_INTERNET')
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        issues=[]
        for vp in VPS:
            pg = await b.new_page(viewport={'width':vp[0],'height':vp[1]})
            await pg.add_init_script("try { localStorage.getItem('dora-consent') || localStorage.setItem('dora-consent', JSON.stringify({value:'all',at:'test'})) } catch (e) {}")
            cur={'r':''}
            pg.on('pageerror', lambda e: issues.append(f'{vp} {cur["r"]} JS: {e}'))
            pg.on('console', lambda m: (m.type=='error' and not any(x in m.text for x in IGN)) and issues.append(f'{vp} {cur["r"]} console: {m.text[:140]}'))
            await pg.goto('http://localhost:4173/'); await pg.wait_for_timeout(2600)
            for r in ROUTES:
                cur['r']=r
                await pg.goto('http://localhost:4173/#'+r); await pg.wait_for_timeout(1000)
                d = await pg.evaluate("""(()=>({ov: document.documentElement.scrollWidth - innerWidth, h1: document.querySelectorAll('h1').length,
                  navVisible: !!document.querySelector('.nav, .a-side'), canv: document.querySelectorAll('canvas.era-canvas').length,
                  textOverflow: [...document.querySelectorAll('h1,h2,.ticket-city,.paper-title,.merch-title,.tour-title,.stage-track')].filter(e=>{const r=e.getBoundingClientRect(); return r.width && (e.scrollWidth>e.clientWidth+2) && getComputedStyle(e).overflow!=='visible'}).map(e=>e.className).slice(0,3)}))()""")
                if d['ov']>2 and r!='/': issues.append(f'{vp} {r} horizontal overflow {d["ov"]}px')
                if d['h1']!=1 and r not in ('/admin',): issues.append(f'{vp} {r} h1 count={d["h1"]}')
                if d['canv']!=1: issues.append(f'{vp} {r} era canvas count={d["canv"]}')
                if d['textOverflow']: issues.append(f'{vp} {r} clipped text {d["textOverflow"]}')
            await pg.close()
        # Accessibility (desktop + mobile)
        for vp in [(1440,900),(375,667)]:
            pg = await b.new_page(viewport={'width':vp[0],'height':vp[1]})
            await pg.add_init_script("try { localStorage.getItem('dora-consent') || localStorage.setItem('dora-consent', JSON.stringify({value:'all',at:'test'})) } catch (e) {}")
            await pg.goto('http://localhost:4173/'); await pg.wait_for_timeout(2600)
            for r in ROUTES[:7]:
                await pg.goto('http://localhost:4173/#'+r); await pg.wait_for_timeout(900)
                await pg.add_script_tag(content=AXE)
                res = await pg.evaluate("axe.run(document,{resultTypes:['violations'], rules:{'color-contrast':{enabled:true}}}).then(r=>r.violations.map(v=>[v.id,v.impact,v.nodes.length,v.nodes.slice(0,2).map(n=>n.target.join(' '))]))")
                for v in res:
                    if v[1] in ('critical','serious'): issues.append(f'A11Y {vp[0]} {r} {v[0]} ({v[1]}) x{v[2]} {v[3]}')
            await pg.close()
        print(len(issues),'issues'); print('\n'.join(issues))
        await b.close()
asyncio.run(main())

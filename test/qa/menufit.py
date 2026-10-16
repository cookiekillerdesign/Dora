import asyncio, os
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        for w,h in [(320,568),(375,667),(390,844)]:
            c = await b.new_context(viewport={'width':w,'height':h}, is_mobile=True, has_touch=True); m = await c.new_page()
            await m.add_init_script("try { localStorage.setItem('dora-consent', JSON.stringify({value:'necessary'})) } catch(e) {}")
            await m.goto('http://localhost:4173/#/tour'); await m.wait_for_timeout(4000)
            await m.tap('.nav-burger'); await m.wait_for_timeout(1200)
            r = await m.evaluate("""(()=>{const links=[...document.querySelectorAll('.menu-link')]; const soc=document.querySelector('.menu .socials')?.getBoundingClientRect(); const leg=document.querySelector('.menu-legal')?.getBoundingClientRect();
              const last=links[links.length-1].getBoundingClientRect(); return {n:links.length, right:Math.round(Math.max(...links.map(a=>a.getBoundingClientRect().right))),
              lastBottom:Math.round(last.bottom), socTop: soc?Math.round(soc.top):null, socBottom: soc?Math.round(soc.bottom):null, scroll: document.querySelector('.menu').scrollHeight>document.querySelector('.menu').clientHeight, legalBottom: leg?Math.round(leg.bottom):null}})()""")
            fits = r['right']<=w-6 and (r['socTop'] is None or r['lastBottom']<=r['socTop']) and (r['legalBottom'] or 0)<=h
            print(f'{w}x{h}:', 'PASS' if fits else 'FAIL', r)
            await c.close()
        await b.close()
asyncio.run(main())

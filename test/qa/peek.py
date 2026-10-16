import asyncio, os
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        for w,h in [(320,568),(375,667),(390,844)]:
            pg = await b.new_page(viewport={'width':w,'height':h})
            await pg.add_init_script("try { localStorage.setItem('dora-consent', JSON.stringify({value:'necessary'})) } catch(e) {}")
            await pg.goto('http://localhost:4173/'); await pg.wait_for_timeout(3000)
            H = await pg.evaluate('document.documentElement.scrollHeight-innerHeight')
            await pg.evaluate(f'window.scrollTo(0,{H}*{1.35/11.2})'); await pg.wait_for_timeout(3000)
            r = await pg.evaluate("""(()=>{const c=document.querySelector('.panel--prologue .era-clip').getBoundingClientRect();
              const vis={l:Math.max(c.left,0), r:Math.min(c.right,innerWidth), t:c.top, b:c.bottom};
              const hits=[...document.querySelectorAll('.panel--prologue .pro-text, .panel--prologue .listen, .panel--prologue .pro-title')].filter(e=>{const q=e.getBoundingClientRect(); return !(q.right<=vis.l||q.left>=vis.r||q.bottom<=vis.t||q.top>=vis.b)}).map(e=>e.className.split(' ')[0]);
              return {видимая_часть: Math.round(vis.r-vis.l)+'px', пересечения: hits}})()""")
            print(w, r); await pg.close()
        await b.close()
asyncio.run(main())

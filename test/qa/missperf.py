import asyncio, os
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
FPS="new Promise(r=>{let n=0;const t0=performance.now();const f=()=>{n++; if(performance.now()-t0<2500) requestAnimationFrame(f); else r(Math.round(n/2.5*10)/10)}; requestAnimationFrame(f)})"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width':1280,'height':720})
        await pg.add_init_script("try { localStorage.setItem('dora-consent', JSON.stringify({value:'necessary'})) } catch(e) {}")
        await pg.goto('http://localhost:4173/'); await pg.wait_for_timeout(4500)
        H = await pg.evaluate('document.documentElement.scrollHeight-innerHeight')
        async def at(ch):
            await pg.evaluate(f'window.scrollTo(0,{H}*{(ch+(ch-1)*0.7+0.35)/11.2})'); await pg.wait_for_timeout(3500)
        res={}
        for ch,name in [(3,'кьют-рок'),(4,'MISS'),(5,'LOVESONGS')]:
            await at(ch); res[name]=await pg.evaluate(FPS)
        print('кадров/с на главах:', res)
        await at(4)
        tests=[('без анимации и тени надписи MISS', ".miss-title{animation:none!important;filter:none!important}"),
               ('+ без размытия под карточкой', ".miss-card{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}"),
               ('+ без WebGL-фона', ".era-canvas{display:none!important}")]
        css=''
        for name,rule in tests:
            css+=rule
            await pg.evaluate(f"(()=>{{let s=document.getElementById('perf-test'); if(!s){{s=document.createElement('style'); s.id='perf-test'; document.head.appendChild(s)}} s.textContent={css!r}}})()")
            await pg.wait_for_timeout(1500)
            print(f'MISS {name}:', await pg.evaluate(FPS))
        await b.close()
asyncio.run(main())

import asyncio, os
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
FPS="new Promise(r=>{let n=0;const t0=performance.now();const f=()=>{n++; if(performance.now()-t0<2000) requestAnimationFrame(f); else r(Math.round(n/2.0*10)/10)}; requestAnimationFrame(f)})"
VARIANTS=[
 ('как сейчас (слой + тень)', ''),
 ('без слоя, с тенью', '.miss-title{will-change:auto!important;transform:none!important}'),
 ('без тени, со слоем', '.miss-title{filter:none!important}'),
 ('без тени и без слоя', '.miss-title{filter:none!important;will-change:auto!important;transform:none!important}'),
 ('тень как text-shadow-подложка', '.miss-title{filter:none!important;will-change:auto!important;transform:none!important}.miss-title::before{content:"MISS";position:absolute;inset:0;z-index:-1;color:transparent;text-shadow:0 18px 40px rgba(35,8,31,.55)}'),
]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width':1280,'height':720})
        await pg.goto('http://localhost:4173/'); await pg.wait_for_timeout(4500)
        H = await pg.evaluate('document.documentElement.scrollHeight-innerHeight')
        await pg.evaluate(f'window.scrollTo(0,{H}*{(4+3*0.7+0.35)/11.2})'); await pg.wait_for_timeout(3500)
        import random, statistics
        order=[v for v in VARIANTS for _ in range(3)]; random.seed(7); random.shuffle(order)
        res={}
        for name,css in order:
            await pg.evaluate(f"(()=>{{let s=document.getElementById('ab'); if(!s){{s=document.createElement('style'); s.id='ab'; document.head.appendChild(s)}} s.textContent={css!r}}})()")
            await pg.wait_for_timeout(1000)
            res.setdefault(name,[]).append(await pg.evaluate(FPS))
        for name,_ in VARIANTS: print(f'{name}: медиана {statistics.median(res[name])} ({res[name]})')
        await b.close()
asyncio.run(main())

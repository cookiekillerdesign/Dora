import asyncio, os
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
Q="""()=>{const nav=document.querySelector('.nav').getBoundingClientRect().bottom; const out=[];
 document.querySelectorAll('.h-track > .panel').forEach((p,i)=>p.querySelectorAll('.era-clip, .call-tilt').forEach(c=>{ if(getComputedStyle(c).display==='none') return;
  const r=(c.querySelector('.ep-inner')||c).getBoundingClientRect(); if(r.top<nav-2) out.push(`глава ${i} ${c.className.split(' ').slice(-1)[0]}: верх ${Math.round(r.top)} < шапка ${Math.round(nav)}`)})); return out}"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        for w,h in [(1903,914),(1440,900),(1280,720),(1024,768)]:
            pg = await b.new_page(viewport={'width':w,'height':h})
            await pg.goto('http://localhost:4173/'); await pg.wait_for_timeout(4000)
            r = await pg.evaluate(Q); print(f'{w}x{h}: шапка свободна' if not r else f'{w}x{h}: {r}'); await pg.close()
        await b.close()
asyncio.run(main())

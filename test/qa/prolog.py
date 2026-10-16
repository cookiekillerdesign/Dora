import asyncio, os
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        for w,h,tag in [(320,568,'x'),(375,667,'s'),(390,844,'m')]:
            pg = await b.new_page(viewport={'width':w,'height':h})
            await pg.add_init_script("try { localStorage.setItem('dora-consent', JSON.stringify({value:'necessary'})) } catch(e) {}")
            await pg.goto('http://localhost:4173/'); await pg.wait_for_timeout(4200)
            H = await pg.evaluate('document.documentElement.scrollHeight-innerHeight')
            await pg.evaluate(f'window.scrollTo(0,{H}*{(1+0.35)/11.2})'); await pg.wait_for_timeout(3500)
            fit = await pg.evaluate("(()=>{const p=document.querySelector('.panel--prologue'); const pr=p.getBoundingClientRect(); return [...p.querySelectorAll('.pro-text, .listen, .pro-title')].map(e=>{const r=e.getBoundingClientRect(); return [e.className.split(' ')[0], Math.round(r.top), Math.round(r.bottom), r.bottom<=innerHeight && r.top>=0]})})()")
            print(w, h, fit)
            await pg.screenshot(path=f'/tmp/pr_{tag}.png'); await pg.close()
        await b.close()
asyncio.run(main())

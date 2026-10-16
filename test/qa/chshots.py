import asyncio, os, sys
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
W,H,tag = int(sys.argv[1]), int(sys.argv[2]), sys.argv[3]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        ctx = await b.new_context(viewport={'width':W,'height':H}, is_mobile=W<800, has_touch=W<800)
        pg = await ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.add_init_script("try { localStorage.setItem('dora-consent', JSON.stringify({value:'necessary'})) } catch(e) {}")
        await pg.goto('http://localhost:4173/'); await pg.wait_for_timeout(4200)
        Hh = await pg.evaluate('document.documentElement.scrollHeight-innerHeight')
        for i in range(1,8):
            mid = 0 if i==0 else min(1, (i + (i-1)*0.7 + 0.35)/11.2) if i<7 else 1
            await pg.evaluate(f'document.documentElement.style.scrollSnapType="none"; window.scrollTo(0,{Hh}*{mid})'); await pg.wait_for_timeout(3000)
            await pg.screenshot(path=f'/tmp/c{tag}{i}.png')
        # пересечения текста и фото в каждой главе
        print('errors', errs); await b.close()
asyncio.run(main())

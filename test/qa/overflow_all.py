import asyncio, os
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
ROUTES=['/music','/tour','/news','/merch','/merch/tee','/organizers','/legal','/privacy','/cookies','/terms','/admin']
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        out=[]
        for lang in ['ru','en']:
            for w in [320, 768, 1024, 1440]:
                pg = await b.new_page(viewport={'width':w,'height':640})
                await pg.add_init_script(f"try {{ localStorage.setItem('dora-lang','{lang}'); localStorage.setItem('dora-consent', JSON.stringify({{value:'necessary'}})) }} catch(e) {{}}")
                await pg.goto('http://localhost:4173/'); await pg.wait_for_timeout(2200)
                for r in ROUTES:
                    await pg.goto('http://localhost:4173/#'+r); await pg.wait_for_timeout(600)
                    ov = await pg.evaluate('document.documentElement.scrollWidth - innerWidth')
                    if ov>1: out.append(f'{lang} {w} {r} +{ov}px')
                if False:
                    await pg.goto('http://localhost:4173/#/terms'); await pg.wait_for_timeout(800); await pg.screenshot(path='/tmp/n_terms.png')
                    await pg.goto('http://localhost:4173/#/organizers'); await pg.wait_for_timeout(1500); await pg.screenshot(path='/tmp/n_org.png')
                await pg.close()
        print('переполнений:', len(out), out)
        await b.close()
asyncio.run(main())

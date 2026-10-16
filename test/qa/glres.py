import asyncio, os, sys
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        for label, w, h, dsf, mob in [('iPhone 390@3x',390,844,3,True),('ноутбук 1440@2x',1440,900,2,False),('монитор 1920@1x',1920,1080,1,False)]:
            c = await b.new_context(viewport={'width':w,'height':h}, device_scale_factor=dsf, is_mobile=mob, has_touch=mob); pg = await c.new_page()
            await pg.goto('http://localhost:4173/'); await pg.wait_for_timeout(int(sys.argv[1]) if len(sys.argv)>1 else 6000)
            cw = await pg.evaluate("document.querySelector('.era-canvas').width")
            phys = w*dsf
            print(f'{label}: экран {phys} физ. px, фон считается в {cw} px -> растяжение в {phys/cw:.1f} раза')
            if mob: await pg.screenshot(path=f'/tmp/gl_{sys.argv[2] if len(sys.argv)>2 else "before"}.png', clip={'x':0,'y':300,'width':390,'height':260})
            await c.close()
        await b.close()
asyncio.run(main())

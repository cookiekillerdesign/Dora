import asyncio, os
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        for label, dsf, consent in [('dsf1 без согласия',1,False),('dsf1 с согласием',1,True),('dsf3 с согласием',3,True)]:
            c = await b.new_context(viewport={'width':390,'height':844}, is_mobile=True, has_touch=True, device_scale_factor=dsf); m = await c.new_page(); errs=[]
            m.on('pageerror', lambda e: errs.append(str(e))); m.on('console', lambda x: x.type=='error' and errs.append(x.text[:150]))
            if consent: await m.add_init_script("try { localStorage.setItem('dora-consent', JSON.stringify({value:'necessary'})) } catch(e) {}")
            await m.goto('http://localhost:4173/')
            gone=None
            for t in range(1,41):
                await m.wait_for_timeout(250)
                st = await m.evaluate("(()=>{const p=document.querySelector('.preloader'); if(!p) return null; return {bar: p.querySelector('.pl-bar')?.style.transform, fonts: document.fonts.status}})()")
                if st is None: gone=t*250; break
            print(label, '-> заставка ушла через', gone, 'мс' if gone else f'НЕ УШЛА за 10 с, состояние: {st}', errs[:2])
            await c.close()
        await b.close()
asyncio.run(main())

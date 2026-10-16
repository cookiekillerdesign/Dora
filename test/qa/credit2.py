import asyncio, os
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        for w,h,dsf,mob,url,tag in [(1440,900,2,False,'http://localhost:4173/#/tour','d'),(390,844,3,True,'http://localhost:4173/#/legal','m')]:
            c = await b.new_context(viewport={'width':w,'height':h}, device_scale_factor=dsf, is_mobile=mob, has_touch=mob); pg = await c.new_page()
            await pg.add_init_script("try { localStorage.setItem('dora-consent', JSON.stringify({value:'necessary'})) } catch(e) {}")
            await pg.goto(url); await pg.wait_for_timeout(3000)
            await pg.evaluate('window.scrollTo(0, document.documentElement.scrollHeight)'); await pg.wait_for_timeout(800)
            info = await pg.evaluate("""(()=>{const a=document.querySelector('.credit--foot'); const svg=a.querySelector('svg'); const p=svg&&svg.querySelector('path');
              return {svg: !!svg, fill: p && getComputedStyle(p).fill, text: a.innerText.trim(), mask: getComputedStyle(a.querySelector('.credit-logo')).webkitMaskImage}})()""")
            print(tag, info)
            r = await pg.evaluate("(()=>{const b=document.querySelector('.credit--foot').getBoundingClientRect(); return {x:b.x-6,y:b.y-6,width:b.width+12,height:b.height+12}})()")
            await pg.screenshot(path=f'/tmp/cr2_{tag}.png', clip=r)
            await c.close()
        await b.close()
asyncio.run(main())

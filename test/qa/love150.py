import asyncio, os
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        for w,h in [(1903,914),(1440,900),(1280,720),(1024,768)]:
            pg = await b.new_page(viewport={'width':w,'height':h})
            await pg.add_init_script("try { localStorage.setItem('dora-consent', JSON.stringify({value:'necessary'})) } catch(e) {}")
            await pg.goto('http://localhost:4173/'); await pg.wait_for_timeout(3500)
            H = await pg.evaluate('document.documentElement.scrollHeight-innerHeight')
            await pg.evaluate(f'window.scrollTo(0,{H}*{(5+4*0.7+0.35)/11.2})'); await pg.wait_for_timeout(3500)
            r = await pg.evaluate("""(()=>{const ph=document.querySelector('.era-clip--lovesongs .ep-inner').getBoundingClientRect(), c=document.querySelector('.call').getBoundingClientRect();
              return {photoTop: Math.round(ph.top), photoBottom: Math.round(ph.bottom), cardTop: Math.round(c.top), cardBottom: Math.round(c.bottom), h: innerHeight}})()""")
            ok = r['photoBottom'] <= h and r['cardBottom'] <= h
            print(f"{w}x{h}: фото {r['photoTop']}–{r['photoBottom']}, карточка {r['cardTop']}–{r['cardBottom']} ->", 'в экране' if ok else 'ВЫХОДИТ ЗА НИЗ')
            if w==1440: await pg.screenshot(path='/tmp/love150.png')
            await pg.close()
        await b.close()
asyncio.run(main())

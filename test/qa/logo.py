import asyncio, os
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
def p(*a): print(*a, flush=True)
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width':1440,'height':900}); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.add_init_script("try { localStorage.setItem('dora-consent', JSON.stringify({value:'necessary'})) } catch(e) {}")
        await pg.goto('http://localhost:4173/'); await pg.wait_for_timeout(5200)
        await pg.screenshot(path='/tmp/lg_cover.png')
        info = await pg.evaluate("""(()=>{const i=document.querySelector('.cover-jelly img'); const m=document.querySelector('.nav-mark img');
          return {heroLoaded: i.complete && i.naturalWidth>0, heroW: Math.round(i.getBoundingClientRect().width), chosen: i.currentSrc.slice(0,30),
                  markLoaded: m.complete && m.naturalWidth>0, markH: Math.round(m.getBoundingClientRect().height), markBlend: getComputedStyle(m.closest('.nav-mark')).mixBlendMode,
                  linksBlend: getComputedStyle(document.querySelector('.nav')).mixBlendMode}})()""")
        p('логотип на главной загружен:', info['heroLoaded'], '| ширина', info['heroW'], '| шапка:', info['markLoaded'], info['markH'], 'px | шапка без инверсии:', info['markBlend']=='normal', '| ссылки difference:', info['linksBlend']=='difference')
        await pg.evaluate("window.__fx=0; new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{ if(n.classList&&n.classList.contains('fx-p')) __fx++ }))).observe(document.body,{childList:true,subtree:true})")
        await pg.click('.cover-logo'); await pg.wait_for_timeout(400)
        p('клик: желейная встряска + звёзды:', await pg.evaluate('__fx')>0)
        H = await pg.evaluate('document.documentElement.scrollHeight-innerHeight')
        for i,ch in [(1,1),(2,2),(3,3),(6,6)]:
            await pg.evaluate(f'window.scrollTo(0,{H}*{(ch+(ch-1)*0.7+0.35)/11.2})'); await pg.wait_for_timeout(2600)
            await pg.screenshot(path=f'/tmp/lg_h{i}.png', clip={'x':0,'y':0,'width':1440,'height':70})
        await pg.goto('http://localhost:4173/#/tour'); await pg.wait_for_timeout(1200); await pg.evaluate('window.scrollTo(0,500)'); await pg.wait_for_timeout(800)
        await pg.screenshot(path='/tmp/lg_tour.png', clip={'x':0,'y':0,'width':1440,'height':70})
        m = await b.new_page(viewport={'width':390,'height':844}, is_mobile=True, has_touch=True); m.on('pageerror', lambda e: errs.append(str(e)))
        await m.add_init_script("try { localStorage.setItem('dora-consent', JSON.stringify({value:'necessary'})) } catch(e) {}")
        await m.goto('http://localhost:4173/'); await m.wait_for_timeout(5200)
        p('телефон: выбран лёгкий вариант 820:', '820' in (await m.evaluate("document.querySelector('.cover-jelly img').currentSrc")) or 'data:' in (await m.evaluate("document.querySelector('.cover-jelly img').currentSrc"))[:6])
        await m.screenshot(path='/tmp/lg_m.png')
        p('errors', errs)
        await b.close()
asyncio.run(main())

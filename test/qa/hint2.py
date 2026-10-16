import asyncio, os
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
LOG="""try { localStorage.setItem('dora-consent', JSON.stringify({value:'necessary'})) } catch(e) {}
window.__hint=[]; window.__ready=null;
addEventListener('dora-ready', ()=>{ window.__ready=performance.now() });
new MutationObserver(()=>{ const e=document.querySelector('.scroll-hint'); if(!e||e.__w) return; e.__w=1;
  new MutationObserver(()=>window.__hint.push([e.classList.contains('is-on')?'видна':'скрыта', Math.round(performance.now())])).observe(e,{attributes:true,attributeFilter:['class']}) }).observe(document,{childList:true,subtree:true});"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width':1440,'height':900})
        await pg.add_init_script(LOG)
        await pg.goto('http://localhost:4173/'); await pg.wait_for_timeout(45000)
        r = await pg.evaluate("({ready: Math.round(window.__ready), log: window.__hint})")
        base = r['ready']
        print('логотип приземлился (сигнал заставки):', base, 'мс')
        print('стою на обложке:', ' -> '.join(f"{(t-base)/1000:.1f}с {s}" for s,t in r['log']))
        pg2 = await b.new_page(viewport={'width':1440,'height':900}); await pg2.add_init_script(LOG)
        await pg2.goto('http://localhost:4173/'); await pg2.wait_for_function("window.__hint.some(x=>x[0]=='видна')", timeout=20000)
        await pg2.mouse.move(700,400); await pg2.mouse.wheel(0, 600); await pg2.wait_for_timeout(2500)
        on = await pg2.evaluate("document.querySelector('.scroll-hint').classList.contains('is-on')")
        await pg2.evaluate('window.scrollTo(0,0)'); await pg2.wait_for_timeout(16000)
        r2 = await pg2.evaluate("window.__hint")
        print('листаю во время показа -> видна после прокрутки:', on, '| журнал:', [x[0] for x in r2])
        await b.close()
asyncio.run(main())

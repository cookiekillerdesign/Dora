import asyncio, os
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
def p(*a): print(*a, flush=True)
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width':1440,'height':900})
        await pg.add_init_script("try { localStorage.setItem('dora-consent', JSON.stringify({value:'necessary'})) } catch(e) {}")
        await pg.goto('http://localhost:4173/'); await pg.wait_for_timeout(2400)
        noring=[]; total=0
        for r in ['/music','/tour','/merch','/organizers','/cookies','/']:
            await pg.goto('http://localhost:4173/#'+r); await pg.wait_for_timeout(600)
            await pg.evaluate("document.activeElement && document.activeElement.blur()")
            seen=set()
            for i in range(18):
                await pg.keyboard.press('Tab')
                info = await pg.evaluate("""(()=>{const e=document.activeElement; if(!e||e===document.body) return null; const cs=getComputedStyle(e); const vis=(cs.outlineStyle!=='none' && parseFloat(cs.outlineWidth)>0) || cs.boxShadow!=='none'; return {tag:e.tagName, cls:String(e.className||'').slice(0,28), text:(e.innerText||e.getAttribute('aria-label')||'').slice(0,22), vis}})()""")
                if not info: continue
                k=(info['tag'],info['cls'],info['text'])
                if k in seen: continue
                seen.add(k); total+=1
                if not info['vis']: noring.append((r,)+k)
        p('КЛАВИАТУРА: уникальных элементов в фокусе', total, '| без видимой рамки', len(noring)); [p('  ',x) for x in noring[:10]]
        await pg.goto('http://localhost:4173/#/cookies'); await pg.wait_for_timeout(700)
        p('таблица cookie фокусируется:', await pg.evaluate("document.querySelector('.legal-table-wrap').tabIndex===0"))
        await b.close()
asyncio.run(main())

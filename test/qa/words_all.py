import asyncio, os
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
# ищем заголовки, где слово разорвано посередине: высота строки одного слова больше одной строки
Q="""(()=>{const out=[]; document.querySelectorAll('h1,h2,.pass-title').forEach(h=>{ const words=h.innerText.split(/\\s+/).filter(Boolean); const r=document.createRange(); 
 const tw=document.createTreeWalker(h, NodeFilter.SHOW_TEXT); let n; while((n=tw.nextNode())){ const t=n.textContent; let i=0; for(const w of t.split(/(\\s+)/)){ if(w.trim()){ r.setStart(n,i); r.setEnd(n,i+w.length); if(r.getClientRects().length>1) out.push(w) } i+=w.length } } }); return out})()"""
ROUTES=['/','/music','/music?era=cuterock','/music?era=sister','/music?era=now','/tour','/news','/merch','/merch/tee','/merch/pick','/merch/bracelet','/organizers','/legal','/privacy','/cookies','/terms']
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        out=[]
        for lang in ['ru','en']:
            for w in [320,375,768,1024,1440]:
                pg = await b.new_page(viewport={'width':w,'height':640})
                await pg.add_init_script(f"try {{ localStorage.setItem('dora-lang','{lang}'); localStorage.setItem('dora-consent', JSON.stringify({{value:'necessary'}})) }} catch(e) {{}}")
                await pg.goto('http://localhost:4173/'); await pg.wait_for_timeout(2200)
                for r in ROUTES:
                    await pg.goto('http://localhost:4173/#'+r); await pg.wait_for_timeout(500)
                    br = await pg.evaluate(Q)
                    if br: out.append(f'{lang} {w} {r}: {br[:3]}')
                    if r=='/organizers':
                        await pg.keyboard.type('1111'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(900)
                        br = await pg.evaluate(Q)
                        if br: out.append(f'{lang} {w} {r} (открыто): {br[:3]}')
                        await pg.evaluate("sessionStorage.clear()")
                await pg.close()
        print('разорванных слов:', len(out)); [print(' -',x) for x in out]
        await b.close()
asyncio.run(main())

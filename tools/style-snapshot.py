# Слепок вычисленных стилей: каждая страница, каждый элемент, ключевые свойства
import asyncio, os, sys, json
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
ROUTES=['/','/music','/tour','/news','/merch','/merch/tee','/organizers','/legal','/cookies','/terms']
PROPS=['display','position','fontFamily','fontSize','fontWeight','fontStyle','color','backgroundColor','backgroundImage','marginTop','marginRight','marginBottom','marginLeft',
 'paddingTop','paddingRight','paddingBottom','paddingLeft','gridTemplateColumns','gap','borderTopWidth','borderRadius','letterSpacing','lineHeight','textTransform','zIndex',
 'mixBlendMode','backdropFilter','boxShadow','justifyContent','alignItems','flexDirection','maxWidth','textAlign','whiteSpace','overflow','top','left','right','bottom','width']
JS="""(props)=>{const out=[]; const all=document.querySelectorAll('body *'); let i=0;
 for(const e of all){ if(e.closest('.fx-p,.dura,iframe,svg')) continue; if(e.tagName==='SCRIPT'||e.tagName==='STYLE') continue;
   const cs=getComputedStyle(e); const row={k:e.tagName+'.'+[...e.classList].sort().join('.')+'#'+(i++)};
   for(const p of props) row[p]=cs[p]; out.push(row) } return out}"""
async def main(outfile):
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        res={}
        for w,h in [(1440,900),(390,844)]:
            pg = await b.new_page(viewport={'width':w,'height':h}, reduced_motion='reduce')
            await pg.add_init_script("try { localStorage.setItem('dora-consent', JSON.stringify({value:'necessary'})); localStorage.setItem('dora-lang','ru'); localStorage.setItem('dora-player','yandex') } catch(e) {}")
            await pg.goto('http://localhost:4173/'); await pg.wait_for_timeout(2500)
            for r in ROUTES:
                await pg.goto('http://localhost:4173/#'+r); await pg.wait_for_timeout(1400)
                await pg.evaluate("document.fonts.ready")
                res[f'{w}{r}']=await pg.evaluate(JS, PROPS)
            await pg.close()
        json.dump(res, open(outfile,'w'))
        print('страниц:', len(res), '| элементов:', sum(len(v) for v in res.values()))
        await b.close()
asyncio.run(main(sys.argv[1]))

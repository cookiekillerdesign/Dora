import asyncio, os
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
R=[]
def ok(n,c,e=''): R.append(c); print('PASS' if c else 'FAIL', n, e, flush=True)
INFO="(sel)=>{const e=document.querySelector(sel); if(!e) return null; const r=e.getBoundingClientRect(); const cs=getComputedStyle(e); return {href:e.href, target:e.target, color:cs.color, vis:r.width>0, inView:r.bottom<=innerHeight+1 && r.top>=0}}"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width':1440,'height':900}); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.add_init_script("try { localStorage.setItem('dora-consent', JSON.stringify({value:'necessary'})) } catch(e) {}")
        await pg.goto('http://localhost:4173/'); await pg.wait_for_timeout(3500)
        H = await pg.evaluate('document.documentElement.scrollHeight-innerHeight')
        await pg.evaluate(f'window.scrollTo(0,{H})'); await pg.wait_for_timeout(3000)
        i = await pg.evaluate(INFO, '.credit--outro')
        ok('финал плёнки: подпись видна и в экране', i and i['vis'] and i['inView'], i)
        ok('ссылка на cookiekiller.online в новой вкладке', i and i['href'].startswith('https://cookiekiller.online') and i['target']=='_blank')
        await pg.screenshot(path='/tmp/cr_outro.png', clip={'x':0,'y':620,'width':900,'height':280})
        for path in ['/tour','/legal']:
            await pg.goto('http://localhost:4173/#'+path); await pg.wait_for_timeout(1500)
            await pg.evaluate('window.scrollTo(0, document.documentElement.scrollHeight)'); await pg.wait_for_timeout(800)
            i = await pg.evaluate(INFO, '.credit--foot')
            ok(f'подвал {path}: подпись есть, цвет {i and i["color"]}', i and i['vis'])
            if path=='/legal': await pg.locator('.site-footer').screenshot(path='/tmp/cr_foot.png')
        await pg.goto('http://localhost:4173/#/admin'); await pg.wait_for_timeout(2500)
        ok('вход в админку: подпись под кнопкой', await pg.locator('.credit--login').count()==1)
        await pg.fill('input[type=email]','a@b.c'); await pg.fill('input[type=password]','test'); await pg.click('button.a-btn'); await pg.wait_for_timeout(1200)
        ok('админка: подпись в боковой панели', await pg.locator('.a-side-foot .credit--admin').count()==1)
        m = await b.new_context(viewport={'width':390,'height':844}, is_mobile=True, has_touch=True); mp = await m.new_page()
        await mp.add_init_script("try { localStorage.setItem('dora-consent', JSON.stringify({value:'necessary'})) } catch(e) {}")
        await mp.goto('http://localhost:4173/'); await mp.wait_for_timeout(3500)
        H2 = await mp.evaluate('document.documentElement.scrollHeight-innerHeight')
        await mp.evaluate(f'document.documentElement.style.scrollSnapType="none"; window.scrollTo(0,{H2})'); await mp.wait_for_timeout(3000)
        i = await mp.evaluate(INFO, '.credit--outro')
        ok('телефон: подпись в финале видна и в экране', i and i['vis'] and i['inView'], i and i['inView'])
        await mp.screenshot(path='/tmp/cr_mob.png')
        await mp.close()
        lg = await pg.evaluate("(()=>{const e=document.querySelector('.credit-logo'); if(!e) return null; const r=e.getBoundingClientRect(); return {w:Math.round(r.width), h:Math.round(r.height), svg: !!e.querySelector('svg path'), mask: getComputedStyle(e).webkitMaskImage}})()")
        ok('логотип - встроенный SVG без маски (работает в Safari)', lg is not None and lg['w']>0 and lg['svg'] and lg['mask']=='none' and await pg.locator('.credit-mark').count()==0, lg)
        ok('текст «designed by cookiekiller.online» рядом с логотипом', 'designed by cookiekiller.online' in await pg.locator('.credit').first.inner_text())
        print('errors', errs, '| итого', sum(R), 'из', len(R)); await b.close()
asyncio.run(main())

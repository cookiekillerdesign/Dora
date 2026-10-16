import asyncio, os
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width':1440,'height':900}, device_scale_factor=2)
        await pg.add_init_script("try { localStorage.setItem('dora-consent', JSON.stringify({value:'necessary'})) } catch(e) {}")
        await pg.goto('http://localhost:4173/'); await pg.wait_for_timeout(4000)
        print('подзаголовка обложки нет:', await pg.locator('.cover-sub').count()==0)
        H = await pg.evaluate('document.documentElement.scrollHeight-innerHeight')
        await pg.evaluate(f'window.scrollTo(0,{H}*{(2+0.7+0.35)/11.2})'); await pg.wait_for_timeout(3500)
        r = await pg.evaluate("(()=>{const b=document.querySelector('.sis-badge').getBoundingClientRect(); return {x:b.x-8,y:b.y-8,width:b.width+16,height:b.height+16}})()"); await pg.evaluate("document.querySelectorAll('.sis-badge svg').forEach(s=>s.style.animation='none')"); await pg.wait_for_timeout(300); await pg.screenshot(path='/tmp/f_badge.png', clip=r)
        tl = await pg.evaluate("(()=>{const t=document.querySelector('.sis-badge textPath'); return Math.round(t.getComputedTextLength())})()")
        print('длина текста значка:', tl, 'из 276')
        await pg.evaluate(f'window.scrollTo(0,{H}*{(5+4*0.7+0.35)/11.2})'); await pg.wait_for_timeout(3500)
        await pg.screenshot(path='/tmp/f_love.png')
        await pg.goto('http://localhost:4173/#/legal'); await pg.wait_for_timeout(1500)
        await pg.locator('.site-footer').screenshot(path='/tmp/f_foot.png')
        print('в подвале нет дисклеймеров:', await pg.locator('.site-footer .meta-note, .site-footer .foot-note, .site-footer .foot-credit').count()==0, '| цвет подвала:', await pg.evaluate("getComputedStyle(document.querySelector('.site-footer .foot-title')).color"))
        m = await b.new_context(viewport={'width':390,'height':844}, is_mobile=True, has_touch=True); mp = await m.new_page()
        await mp.add_init_script("try { localStorage.setItem('dora-consent', JSON.stringify({value:'necessary'})) } catch(e) {}")
        await mp.goto('http://localhost:4173/'); await mp.wait_for_timeout(4000)
        H2 = await mp.evaluate('document.documentElement.scrollHeight-innerHeight')
        await mp.evaluate(f'document.documentElement.style.scrollSnapType="none"; window.scrollTo(0,{H2}*{1.35/11.2})'); await mp.wait_for_timeout(3000)
        print('толщина рамки на телефоне:', await mp.evaluate("getComputedStyle(document.querySelector('.ep--prologue .ep-inner')).paddingTop"))
        await mp.screenshot(path='/tmp/f_mob.png')
        await b.close()
asyncio.run(main())

import asyncio, os, json
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
U='http://localhost:4173/#'
R=[]
def ok(n,c,e=''): R.append(('PASS' if c else 'FAIL',n,e))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader','--js-flags=--expose-gc'])
        pg = await b.new_page(viewport={'width':1440,'height':900}); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.add_init_script("try { localStorage.getItem('dora-consent') || localStorage.setItem('dora-consent', JSON.stringify({value:'all',at:'test'})) } catch (e) {}")
        await pg.goto(U+'/'); await pg.wait_for_timeout(2800)
        # D1 стресс переходов + память
        async def heap():
            await pg.evaluate('window.gc && gc()'); await pg.wait_for_timeout(300)
            return await pg.evaluate('performance.memory.usedJSHeapSize')/1e6
        routes=['/','/music','/tour','/news','/merch','/organizers']
        for r in routes: await pg.goto(U+r); await pg.wait_for_timeout(250)
        h0 = await heap()
        for i in range(5):
            for r in routes: await pg.goto(U+r); await pg.wait_for_timeout(120)
        await pg.goto(U+'/'); await pg.wait_for_timeout(1200)
        h1 = await heap()
        ok('стресс: 30 переходов без ошибок', not errs, errs[:2])
        ok('стресс: память не растёт заметно', h1-h0 < 8, f'{h0:.1f} → {h1:.1f} МБ')
        ok('стресс: один холст фона', await pg.evaluate("document.querySelectorAll('canvas').length")==1)
        ok('стресс: один pin-spacer', await pg.evaluate("document.querySelectorAll('.pin-spacer').length")==1)
        # D2 ресайз посреди ленты
        H = await pg.evaluate('document.documentElement.scrollHeight-innerHeight')
        await pg.evaluate(f'window.scrollTo(0,{H}*3/7)'); await pg.wait_for_timeout(1200)
        await pg.set_viewport_size({'width':390,'height':844}); await pg.wait_for_timeout(1500)
        H2 = await pg.evaluate('document.documentElement.scrollHeight-innerHeight')
        await pg.evaluate(f'window.scrollTo(0,{H2})'); await pg.wait_for_timeout(2200)
        left = await pg.evaluate("Math.round(document.querySelector('.panel--outro').getBoundingClientRect().left)")
        ok('ресайз: финал доезжает после смены размера', abs(left)<3, left)
        await pg.close()

        # D3 reduced motion
        ctx = await b.new_context(viewport={'width':1280,'height':800}, reduced_motion='reduce')
        rp = await ctx.new_page(); rerr=[]; rp.on('pageerror', lambda e: rerr.append(str(e)))
        await rp.add_init_script("try { localStorage.getItem('dora-consent') || localStorage.setItem('dora-consent', JSON.stringify({value:'all',at:'test'})) } catch (e) {}")
        await rp.goto(U+'/'); await rp.wait_for_timeout(700)
        ok('reduced motion: прелоадер пропущен', await rp.locator('.preloader').count()==0)
        for r in routes: await rp.goto(U+r); await rp.wait_for_timeout(300)
        ok('reduced motion: без ошибок', not rerr, rerr[:2])
        await ctx.close()

        # D4 кривые данные из админки
        bad = {
          'news': [{}, {'kind':'weird','head':{'ru':'Только русский'}}, {'head':None,'text':None,'date':'not-a-date'}],
          'tour': [{'date':'2026-12-31'}, {'city':{'ru':'Без даты'}}, {'date':'2027-01-02','city':{'ru':'Город'},'venue':None}],
          'merch': [{'name':{'ru':'Без ссылки'}}, {}],
          'socials': [{'label':'Без ссылки'}, {'label':'Ок','url':'https://x.com'}],
          'eras': [{'id':'prologue','title':{'ru':'Только RU'},'tracks':[]}, {'id':'sister','tracks':None}],
          'clips': [{'id':'miss','head':None,'variant':'unknown'}],
          'settings': {'tourUrl':''}
        }
        bp = await b.new_page(viewport={'width':1440,'height':900}); berr=[]; bp.on('pageerror', lambda e: berr.append(str(e)))
        await bp.add_init_script("try { localStorage.getItem('dora-consent') || localStorage.setItem('dora-consent', JSON.stringify({value:'all',at:'test'})) } catch (e) {}")
        await bp.goto(U+'/'); await bp.evaluate(f"localStorage.setItem('__mockdb', {json.dumps(json.dumps(bad))}); localStorage.setItem('dora-lang','en')")
        await bp.reload(); await bp.wait_for_timeout(3000)
        for r in routes:
            await bp.goto(U+r); await bp.wait_for_timeout(600)
        H = await bp.evaluate('document.documentElement.scrollHeight-innerHeight')
        await bp.goto(U+'/'); await bp.wait_for_timeout(1500)
        for i in range(1,8):
            await bp.evaluate(f'window.scrollTo(0,{H}*{i}/7)'); await bp.wait_for_timeout(500)
        await bp.goto(U+'/music?era=sister'); await bp.wait_for_timeout(800)
        ok('кривые данные: сайт не падает (EN)', not berr, berr[:3])
        await bp.evaluate("localStorage.removeItem('__mockdb')")
        await bp.close()

        # D5 админка: грязная вкладка, загрузка, удаление, вложенная валидация
        ap = await b.new_page(viewport={'width':1280,'height':860}); aerr=[]; ap.on('pageerror', lambda e: aerr.append(str(e)))
        await ap.add_init_script("try { localStorage.getItem('dora-consent') || localStorage.setItem('dora-consent', JSON.stringify({value:'all',at:'test'})) } catch (e) {}")
        dialogs=[]
        async def on_dialog(d):
            dialogs.append(d.message); await (d.dismiss() if 'Уйти' in d.message else d.accept())
        ap.on('dialog', lambda d: asyncio.ensure_future(on_dialog(d)))
        await ap.goto(U+'/admin'); await ap.wait_for_timeout(2600)
        await ap.fill('input[type=email]','a@b.c'); await ap.fill('input[type=password]','test'); await ap.click('button.a-btn'); await ap.wait_for_timeout(800)
        await ap.locator('.l-title').first.click(); await ap.wait_for_timeout(200)
        await ap.locator('fieldset:has(legend:has-text("Текст кнопки")) input').first.fill('X')
        await ap.click('.a-tab:has-text("Тур")'); await ap.wait_for_timeout(400)
        ok('админка: предупреждение при уходе с несохранённым', any('Уйти' in m for m in dialogs) and await ap.locator('.a-tab.is-on:has-text("Главы")').count()==1)
        # вложенная валидация: пустое название трека
        tracks_add = ap.locator('.f--list .l-add').first
        await tracks_add.click(); await ap.wait_for_timeout(200)
        await ap.click('.a-bar .a-btn:not(.a-btn--ghost)'); await ap.wait_for_timeout(300)
        ok('админка: проверка вложенных полей', 'Треки' in await ap.locator('.a-msg').inner_text())
        await ap.click('.a-bar .a-btn--ghost'); await ap.wait_for_timeout(200)
        # мерч: загрузка фото
        await ap.click('.a-tab:has-text("Мерч")'); await ap.wait_for_timeout(400)
        await ap.locator('.l-title').first.click(); await ap.wait_for_timeout(200)
        png = '/tmp/t.png'
        from PIL import Image; Image.new('RGB',(40,40),'pink').save(png)
        await ap.locator('.l-body input[type=file]').first.set_input_files(png); await ap.wait_for_timeout(600)
        ok('админка: загрузка фото показывает превью', await ap.locator('.l-body .f-thumb').count()==1)
        # удаление элемента
        n0 = await ap.locator('.l-item').count()
        await ap.locator('.l-tools .a-icon--danger').last.click(); await ap.wait_for_timeout(300)
        ok('админка: удаление с подтверждением', await ap.locator('.l-item').count()==n0-1)
        await ap.click('.a-bar .a-btn:not(.a-btn--ghost)'); await ap.wait_for_timeout(500)
        ok('админка: сохранение мерча', 'Сохранено' in await ap.locator('.a-msg').inner_text())
        # сброс
        await ap.click('.a-bar .a-link'); await ap.wait_for_timeout(500)
        ok('админка: вернуть исходное', await ap.locator('.l-item').count()==n0 and await ap.evaluate("!('merch' in window.__db.content)"))
        # мобильная админка
        await ap.set_viewport_size({'width':375,'height':740}); await ap.wait_for_timeout(500)
        ok('админка: без горизонтального переполнения на телефоне', await ap.evaluate("document.documentElement.scrollWidth<=innerWidth+2"))
        await ap.screenshot(path='/tmp/admob.png')
        ok('админка: без JS-ошибок', not aerr, aerr[:2])
        print('\n'.join(f'{a}  {n}  {e}' for a,n,e in R))
        await b.close()
asyncio.run(main())

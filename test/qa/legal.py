import asyncio, os
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
AXE=open('./node_modules/axe-core/axe.min.js').read()
R=[]
def ok(n,c,e=''): R.append(('PASS' if c else 'FAIL',n,e)); print(('PASS' if c else 'FAIL'), n, e, flush=True)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        ctx = await b.new_context(viewport={'width':1440,'height':900})
        pg = await ctx.new_page(); errs=[]; ext=[]
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('request', lambda r: ext.append(r.url) if ('googleapis' in r.url or 'gstatic' in r.url or 'spotify' in r.url) else None)
        await pg.goto('http://localhost:4173/'); await pg.wait_for_timeout(2600)
        ok('баннер при первом визите', await pg.locator('.consent').count()==1)
        ok('нет запросов к Google Fonts', not any('google' in u or 'gstatic' in u for u in ext), ext[:2])
        ok('шрифт Dela Gothic One загружен локально', await pg.evaluate("document.fonts.check('16px \"Dela Gothic One\"')"))
        await pg.goto('http://localhost:4173/#/music?era=cuterock'); await pg.wait_for_timeout(1500)
        ok('без согласия плеер Spotify не грузится', await pg.locator('.player iframe').count()==0 and not any('spotify' in u for u in ext))
        ok('вместо плеера карточка с выбором', await pg.locator('.player-card--consent').count()==1)
        await pg.locator('.consent-btn:not(.consent-btn--all)').first.click(); await pg.wait_for_timeout(400)
        ok('«Только необходимое» закрывает баннер', await pg.locator('.consent').count()==0)
        await pg.reload(); await pg.wait_for_timeout(2600)
        ok('выбор сохраняется после перезагрузки', await pg.locator('.consent').count()==0 and await pg.locator('.player iframe').count()==0)
        await pg.locator('.player-card--consent .consent-btn--all').click(); await pg.wait_for_timeout(600)
        ok('кнопка «Включить плеер» загружает Spotify', await pg.locator('.player iframe').count()==1)
        await pg.locator('.foot-legal button').click(); await pg.wait_for_timeout(300)
        ok('«Настройки cookie» снова открывают баннер', await pg.locator('.consent').count()==1)
        await pg.locator('.consent-btn:not(.consent-btn--all)').first.click(); await pg.wait_for_timeout(400)
        ok('отзыв согласия убирает плеер', await pg.locator('.player iframe').count()==0)
        for path, title in [('/legal','Правовая информация'),('/privacy','Политика обработки персональных данных'),('/cookies','Политика использования cookie'),('/terms','Пользовательское соглашение')]:
            await pg.goto('http://localhost:4173/#'+path); await pg.wait_for_timeout(800)
            h = await pg.locator('.legal-title').inner_text()
            ok(f'{path}: открывается', h==title and title in await pg.title(), h)
        await pg.goto('http://localhost:4173/#/legal'); await pg.wait_for_timeout(600)
        ok('пустые данные владельца видны как пометка', await pg.locator('.legal-missing').count()>=3, await pg.locator('.legal-missing').count())
        await pg.goto('http://localhost:4173/#/cookies'); await pg.wait_for_timeout(600)
        ok('в политике cookie виден текущий выбор', 'только необходимое' in await pg.locator('.legal-paper').inner_text())
        await pg.goto('http://localhost:4173/#/tour'); await pg.wait_for_timeout(800)
        ok('в подвале 4 документа и настройки', await pg.locator('.foot-legal a').count()==4 and await pg.locator('.foot-legal button').count()==1)
        ok('пометка о Meta рядом с Instagram', await pg.locator('.meta-note').count()>=1)
        # доступность документов и баннера
        await pg.evaluate("localStorage.removeItem('dora-consent')")
        for path in ['/privacy','/cookies']:
            await pg.goto('http://localhost:4173/#'+path); await pg.reload(); await pg.wait_for_timeout(1800)
            await pg.add_script_tag(content=AXE)
            v = await pg.evaluate("axe.run(document,{resultTypes:['violations']}).then(r=>r.violations.filter(v=>['critical','serious'].includes(v.impact)).map(v=>v.id+' '+v.nodes[0].target.join(' ')))")
            ok(f'доступность {path} (+ баннер)', not v, v)
        m = await b.new_page(viewport={'width':375,'height':700}); m.on('pageerror', lambda e: errs.append(str(e)))
        for path in ['/privacy','/cookies','/legal']:
            await m.goto('http://localhost:4173/#'+path); await m.wait_for_timeout(1500)
            ok(f'телефон {path}: без переполнения', await m.evaluate('document.documentElement.scrollWidth - innerWidth')<=1)
        await m.goto('http://localhost:4173/#/cookies'); await m.wait_for_timeout(1200); await m.screenshot(path='/tmp/lg_m.png')
        await pg.goto('http://localhost:4173/#/privacy'); await pg.wait_for_timeout(1500); await pg.screenshot(path='/tmp/lg_d.png')
        print('errors', errs)
        await b.close()
asyncio.run(main())

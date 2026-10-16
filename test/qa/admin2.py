import asyncio, os
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
U='http://localhost:4173/#'
R=[]
def ok(n,c,e=''): R.append(c); print('PASS' if c else 'FAIL', n, e, flush=True)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        ap = await b.new_page(viewport={'width':1440,'height':900}); errs=[]; ap.on('pageerror', lambda e: errs.append(str(e)))
        ap.on('dialog', lambda d: asyncio.ensure_future(d.accept()))
        await ap.goto(U+'/admin'); await ap.wait_for_timeout(2600)
        await ap.fill('input[type=email]','a@b.c'); await ap.fill('input[type=password]','test'); await ap.click('button.a-btn'); await ap.wait_for_timeout(1000)
        ok('вкладка «Видео» в админке', await ap.locator('.a-tab:has-text("Видео")').count()==1)
        await ap.click('.a-tab:has-text("Видео")'); await ap.wait_for_timeout(500)
        n0 = await ap.locator('.a-item, .l-item, [data-item]').count()
        await ap.locator('button:has-text("Добавить")').first.click(); await ap.wait_for_timeout(400)
        await ap.locator('label:has-text("Название") input').last.fill('Тестовый клип')
        await ap.locator('label:has-text("Ссылка на YouTube") input').last.fill('https://youtu.be/dQw4w9WgXcQ?t=5')
        await ap.wait_for_timeout(300)
        v = await ap.locator('label:has-text("Ссылка на YouTube") input').last.input_value()
        ok('ссылка YouTube превращается в ID', v=='dQw4w9WgXcQ', v)
        await ap.locator('button:has-text("Сохранить")').first.click(); await ap.wait_for_timeout(1200)
        await ap.goto(U+'/video'); await ap.wait_for_timeout(2000)
        ok('новый клип появился на странице «Видео»', await ap.locator('.video-card', has_text='Тестовый клип').count()==1)
        await ap.goto(U+'/admin'); await ap.wait_for_timeout(1500)
        await ap.click('.a-tab:has-text("Фото глав")'); await ap.wait_for_timeout(500)
        for name in ['Младшая сестра', 'Финал']:
            await ap.locator('.l-title', has_text=name).first.click(); await ap.wait_for_timeout(300)
        txt = await ap.locator('.a-main').inner_text()
        ok('«Второе фото» есть для «Младшей сестры» и финала', txt.count('Второе фото')>=2, txt.count('Второе фото'))
        await ap.click('.a-tab:has-text("Главы")'); await ap.wait_for_timeout(500)
        await ap.locator('.l-title', has_text='Сейчас').first.click(); await ap.wait_for_timeout(400)
        # треки внутри главы - вложенный список, раскрываем первый трек
        inner = ap.locator('.l .l .l-title')
        if await inner.count(): await inner.first.click(); await ap.wait_for_timeout(300)
        txt = await ap.locator('.a-main').inner_text()
        ok('поле «Обложка альбома» в главах', 'Обложка альбома' in txt)
        ok('поле «Обложка трека» у треков', 'Обложка трека' in txt or await ap.locator('text=Обложка трека').count()>0)
        print('errors', errs, '| итого', sum(R), 'из', len(R)); await b.close()
asyncio.run(main())

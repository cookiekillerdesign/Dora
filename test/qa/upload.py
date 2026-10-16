import asyncio, os
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
U='http://localhost:4173/#'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        ap = await b.new_page(viewport={'width':1440,'height':900}); errs=[]; ap.on('pageerror', lambda e: errs.append(str(e)))
        await ap.goto(U+'/admin'); await ap.wait_for_timeout(2600)
        await ap.fill('input[type=email]','a@b.c'); await ap.fill('input[type=password]','test'); await ap.click('button.a-btn'); await ap.wait_for_timeout(1000)
        await ap.click('.a-tab:has-text("Фото глав")'); await ap.wait_for_timeout(500)
        await ap.locator('.l-title', has_text='Mental Affection').first.click(); await ap.wait_for_timeout(400)
        for f in ['./test/fixtures/big.png','./test/fixtures/big.jpg']:
            await ap.locator('input[type=file]').first.set_input_files(f); await ap.wait_for_timeout(4000)
            up = await ap.evaluate('window.__uploads?.slice(-1)[0]')
            orig = os.path.getsize(f)
            print(f'{os.path.basename(f)} {round(orig/1e6,1)} МБ -> {up["type"]}, {round(up["size"]/1e3)} КБ (в {round(orig/up["size"],1)} раз меньше), путь .webp: {up["path"].endswith(".webp")}')
        await ap.locator('.l-title', has_text='Финал').first.click(); await ap.wait_for_timeout(300)
        print('поля кадров фотобудки:', await ap.locator('text=Фотобудка: второй кадр').count(), await ap.locator('text=Фотобудка: третий кадр').count())
        await ap.click('.a-tab:has-text("Анонсы")'); await ap.wait_for_timeout(400)
        await ap.locator('.l-title').first.click(); await ap.wait_for_timeout(300)
        print('поле «Фото к анонсу»:', await ap.locator('text=Фото к анонсу').count())
        print('errors', errs); await b.close()
asyncio.run(main())

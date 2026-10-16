import asyncio, os
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        ap = await b.new_page(viewport={'width':1440,'height':900})
        await ap.goto('http://localhost:4173/#/admin'); await ap.wait_for_timeout(2600)
        await ap.fill('input[type=email]','a@b.c'); await ap.fill('input[type=password]','test'); await ap.click('button.a-btn'); await ap.wait_for_timeout(1000)
        await ap.click('.a-tab:has-text("Анонсы")'); await ap.wait_for_timeout(500)
        await ap.locator('.l-title').first.click(); await ap.wait_for_timeout(400)
        print('поле «Фото к анонсу»:', 'PASS' if await ap.locator('text=Фото к анонсу').count()==1 else 'FAIL')
        await b.close()
asyncio.run(main())

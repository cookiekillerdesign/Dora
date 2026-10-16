import asyncio, os
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width':1440,'height':900})
        await pg.add_init_script("try { localStorage.setItem('dora-consent', JSON.stringify({value:'necessary'})) } catch(e) {}")
        await pg.goto('http://localhost:4173/'); await pg.wait_for_timeout(3500)
        # подставляем цветное тестовое фото во второй слот, чтобы проверить отсутствие фильтра
        await pg.evaluate("""(()=>{const m=document.querySelector('.era-clip--sister-2 .ep-media'); const c=document.createElement('canvas'); c.width=400;c.height=300; const g=c.getContext('2d');
          const gr=g.createLinearGradient(0,0,400,0); gr.addColorStop(0,'#1fa34a'); gr.addColorStop(.5,'#2f6fe0'); gr.addColorStop(1,'#f2c230'); g.fillStyle=gr; g.fillRect(0,0,400,300);
          m.innerHTML=''; const i=new Image(); i.src=c.toDataURL(); i.style.cssText='width:100%;height:100%;object-fit:cover;display:block'; m.appendChild(i)})()""")
        st = await pg.evaluate("(()=>{const i=document.querySelector('.era-clip--sister-2 img'); const cs=getComputedStyle(i); return {filter: cs.filter, blend: cs.mixBlendMode}})()")
        print('большое фото «Младшей сестры»: фильтр', st['filter'], '| наложение', st['blend'], '->', 'PASS' if st['filter']=='none' and st['blend']=='normal' else 'FAIL')
        await b.close()
asyncio.run(main())

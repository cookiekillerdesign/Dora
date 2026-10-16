import asyncio, os
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
Q="""()=>{const out=[]; document.querySelectorAll('.h-track > .panel').forEach((p,i)=>{const pr=p.getBoundingClientRect();
  p.querySelectorAll('.era-clip, .call-tilt, .heart-sticker, .sis-badge, .now-cover').forEach(c=>{ if(getComputedStyle(c).display==='none') return;
    const r=(c.querySelector('.ep-inner')||c).getBoundingClientRect(); const l=r.left-pr.left, rr=pr.right-r.right;
    if(l<-1||rr<-1) out.push(`глава ${i} ${c.className.split(' ').slice(-1)[0]}: слева ${Math.round(l)}px, справа ${Math.round(rr)}px`)})}); return out}"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        for w,h in [(390,844),(375,667),(320,568)]:
            ctx = await b.new_context(viewport={'width':w,'height':h}, is_mobile=True, has_touch=True); pg = await ctx.new_page()
            await pg.add_init_script("try { localStorage.setItem('dora-consent', JSON.stringify({value:'necessary'})) } catch(e) {}")
            await pg.goto('http://localhost:4173/'); await pg.wait_for_timeout(4500)
            r = await pg.evaluate(Q)
            print(f'{w}x{h}:', 'всё внутри' if not r else ''); [print('   ', x) for x in r]
            await pg.close()
        await b.close()
asyncio.run(main())

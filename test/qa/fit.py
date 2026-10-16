import asyncio, os
os.environ['PLAYWRIGHT_BROWSERS_PATH']='/opt/pw-browsers'
from playwright.async_api import async_playwright
CHECK="""(i)=>{const p=document.querySelectorAll('.h-track > .panel')[i]; if(!p) return null;
 const vis=e=>{const r=e.getBoundingClientRect(); return r.width>0&&r.height>0&&getComputedStyle(e).display!=='none'};
 const texts=[...p.querySelectorAll('h2, .era-text, .listen, .call, .sis-label, .miss-card, .cr-row, .era-kind, .soc, .outro-note, .now-covers')].filter(vis);
 const out=texts.filter(e=>{const r=e.getBoundingClientRect(); return r.bottom>innerHeight+1||r.top<56}).map(e=>e.className.split(' ')[0]+'@'+Math.round(e.getBoundingClientRect().top)+'-'+Math.round(e.getBoundingClientRect().bottom));
 const clips=[...p.querySelectorAll('.era-clip')].filter(vis).map(c=>c.querySelector('.ep-inner')||c);
 const hits=[]; for(const c of clips){const a=c.getBoundingClientRect(); for(const t of texts){ if(t.closest('.era-clip')) continue; const b=t.getBoundingClientRect(); const ox=Math.min(a.right,b.right)-Math.max(a.left,b.left), oy=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top); if(ox>8&&oy>8) hits.push(t.className.split(' ')[0]+' '+Math.round(ox)+'x'+Math.round(oy))}}
 return {за_экраном: out, фото_на_тексте: hits}}"""
NAMES=['пролог','сестра','кьют-рок','MISS','LOVESONGS','сейчас','финал']
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        for w,h in [(320,568),(375,667),(390,844)]:
            ctx = await b.new_context(viewport={'width':w,'height':h}, is_mobile=True, has_touch=True)
            pg = await ctx.new_page()
            await pg.add_init_script("try { localStorage.setItem('dora-consent', JSON.stringify({value:'necessary'})) } catch(e) {}")
            await pg.goto('http://localhost:4173/'); await pg.wait_for_timeout(4000)
            Hh = await pg.evaluate('document.documentElement.scrollHeight-innerHeight')
            bad=[]
            for i in range(1,8):
                mid = (i + (i-1)*0.7 + 0.35)/11.2 if i<7 else 1
                await pg.evaluate(f'document.documentElement.style.scrollSnapType="none"; window.scrollTo(0,{Hh}*{mid})'); await pg.wait_for_timeout(2600)
                r = await pg.evaluate(CHECK, i)
                if r and (r['за_экраном'] or r['фото_на_тексте']): bad.append((NAMES[i-1], r))
                if w==320: await pg.screenshot(path=f'/tmp/s{i}.png')
            print(f'{w}x{h}:', 'всё помещается' if not bad else ''); [print('   ', x) for x in bad]
            await ctx.close()
        await b.close()
asyncio.run(main())

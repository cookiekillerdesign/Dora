export const vert = `
attribute vec2 p;
void main(){ gl_Position = vec4(p, 0.0, 1.0); }
`

// Шесть паттернов: тетрадь, ксерокс-растр, пузыри кьют-рока, жидкий хром MISS,
// тёплое боке LOVESONGS и снег последних синглов. uEra плавно смешивает соседние.
export const frag = `
precision highp float;
uniform vec2 uRes;
uniform float uScale;
uniform float uTime;
uniform float uEra;
uniform float uBeat;
uniform float uDura;
uniform vec2 uMouse;

float hash(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x), mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x), u.y);
}
float fbm(vec2 p){ float v=0., a=.5; for(int i=0;i<4;i++){ v+=a*noise(p); p*=2.02; a*=.5; } return v; }

float heart(vec2 p, float s){
  p /= s; p.y -= .25;
  p.x = abs(p.x);
  float a = atan(p.x, p.y)/3.14159;
  float r = length(p);
  float h = abs(a);
  float d = (13.0*h - 22.0*h*h + 10.0*h*h*h)/(6.0-5.0*h);
  return r - d*.55;
}

vec3 eraPaper(vec2 px, vec2 uv, vec2 a){
  vec3 paper = vec3(.935,.94,.95);
  float cell = 26.0;
  vec2 f = fract(px/cell);
  vec2 d = min(f, 1.0-f)*cell;
  float l = 1.0 - smoothstep(0.0, 1.1, min(d.x,d.y));
  vec3 col = mix(paper, vec3(.62,.75,.9), l*.65);
  float margin = 1.0 - smoothstep(0.0, 1.4, abs(px.x - uRes.x/uScale*.1));
  col = mix(col, vec3(.89,.23,.23), margin*.8);
  col *= .965 + .035*noise(px*.35);
  // чернильная клякса за курсором
  float ink = smoothstep(.22, 0.0, length(a - uMouse) + .05*fbm(a*6.0+uTime*.2));
  col = mix(col, vec3(.12,.25,.69), ink*.22);
  return col;
}

vec3 eraXerox(vec2 px, vec2 uv, vec2 a){
  float cell = 13.0;
  vec2 c = floor(px/cell)*cell + cell*.5;
  float n = fbm(c*.0045 + vec2(0.0, uTime*.07)) + uBeat*.25;
  n += .25*smoothstep(.45, 0.0, length(a - uMouse));
  float r = cell*.55*smoothstep(.32, .78, n);
  float dt = 1.0 - smoothstep(r-1.0, r+1.0, length(px-c));
  vec3 col = mix(vec3(0.0), vec3(1.0,.24,.55), dt);
  float streak = step(.988, hash(vec2(floor(px.y*.35), floor(uTime*10.0))));
  col += streak*.18;
  float yellow = smoothstep(.62,.66, fbm(px*.0025 - uTime*.03));
  col = mix(col, vec3(1.,.89,.36)*dt + vec3(0.0)*(1.0-dt), yellow*.9);
  return col;
}

vec3 eraBubbles(vec2 px, vec2 uv, vec2 a){
  vec3 col = mix(vec3(1.0,.72,.86), vec3(.66,.86,1.0), uv.y);
  float asp = uRes.x/uRes.y;
  for(int i=0;i<14;i++){
    float fi = float(i);
    float sp = .025 + .035*hash(vec2(fi,3.0));
    vec2 p = vec2((hash(vec2(fi,1.0))-.5)*asp, fract(hash(vec2(fi,2.0)) + uTime*sp)*1.4 - .7);
    p.x += .04*sin(uTime*.7 + fi*1.7);
    float s = .05 + .09*hash(vec2(fi,4.0));
    s *= 1.0 + uBeat*.12;
    vec2 q = a - p;
    if (mod(fi, 3.0) < 1.0) {
      float h = heart(q, s*1.4);
      col = mix(col, vec3(.88,.06,.23), 1.0 - smoothstep(0.0, .006, h));
      col = mix(col, vec3(1.0), (1.0 - smoothstep(0.0,.02, length(q - vec2(-s*.25, s*.2)) - s*.08))*.8);
    } else {
      float d = length(q) - s;
      float rim = smoothstep(.012, 0.0, abs(d));
      float fill = 1.0 - smoothstep(0.0, .004, d);
      col = mix(col, col*1.05 + .04, fill*.6);
      col = mix(col, vec3(1.0), rim*.85);
      col = mix(col, vec3(1.0), (1.0 - smoothstep(0.0,.012, length(q - vec2(-s*.4, s*.4)) - s*.12))*fill);
    }
  }
  return col;
}

vec3 eraChrome(vec2 px, vec2 uv, vec2 a){
  vec2 q = a*1.5;
  float t = uTime*.11;
  vec2 w = vec2(fbm(q + t), fbm(q + vec2(5.2,1.3) - t));
  float f = fbm(q + 2.2*w + (uMouse)*.6);
  float b = .5 + .5*sin(f*15.0 + t*2.0 + uBeat*1.5);
  vec3 col = mix(vec3(.10,.02,.09), vec3(.78,.79,.84), smoothstep(.15, .85, b));
  col = mix(col, vec3(.69,.29,.62), smoothstep(.45,.55,b)*.35);
  col = mix(col, vec3(1.0), pow(smoothstep(.86, 1.0, b), 3.0));
  vec2 g = floor(px/22.0);
  vec2 cf = fract(px/22.0) - .5;
  float star = smoothstep(.08, 0.0, length(cf)) + smoothstep(.03, 0.0, abs(cf.x))*smoothstep(.45, 0.0, abs(cf.y)) + smoothstep(.03, 0.0, abs(cf.y))*smoothstep(.45, 0.0, abs(cf.x));
  float tw = step(.985, hash(g)) * pow(.5+.5*sin(uTime*3.0 + hash(g+1.0)*30.0), 12.0);
  col += tw*star*.9;
  return col;
}

vec3 eraBokeh(vec2 px, vec2 uv, vec2 a){
  vec3 col = mix(vec3(.33,.05,.13), vec3(.86,.62,.6), smoothstep(-.2, 1.2, uv.y));
  float asp = uRes.x/uRes.y;
  for(int i=0;i<12;i++){
    float fi = float(i);
    vec2 p = vec2((hash(vec2(fi,7.0))-.5)*asp*1.1, (hash(vec2(fi,8.0))-.5)*1.1);
    p += .05*vec2(sin(uTime*.2+fi), cos(uTime*.17+fi*1.3));
    float r = .06 + .12*hash(vec2(fi,9.0));
    float d = length(a - p);
    float disc = smoothstep(r, r*.75, d);
    col += vec3(1.0,.7,.42)*disc*(.08 + .06*hash(vec2(fi,10.0)))*(1.0+uBeat*.6);
  }
  float lamp = smoothstep(.7, 0.0, length(a - uMouse));
  col += vec3(1.0,.55,.3)*lamp*.12;
  return col;
}

vec3 eraSnow(vec2 px, vec2 uv, vec2 a){
  vec3 col = mix(vec3(.03,.06,.18), vec3(.22,.32,.58), uv.y);
  for(int l=0;l<3;l++){
    float fl = float(l);
    vec2 sp = a*(5.0 + fl*4.0);
    sp.y += uTime*(.35 + fl*.25);
    sp.x += sin(uTime*.3 + fl)*.4;
    vec2 id = floor(sp);
    vec2 f = fract(sp) - .5;
    float h = hash(id + fl*13.0);
    vec2 o = vec2(h - .5, fract(h*7.13) - .5)*.6;
    float d = length(f - o);
    col += smoothstep(.07 - fl*.015, 0.0, d)*step(.45, h)*(.9 - fl*.2);
  }
  col += vec3(1.0,.18,.39)*.35*smoothstep(.55, 0.0, uv.y)*(.6 + .4*uBeat);
  return col;
}

// Обложка (эра -1): современная Дора - желейный розовый космос в духе логотипа.
// Глубокая слива, голографическое сияние (розовый и мятный, как звёзды логотипа),
// розовое свечение за логотипом, мерцающие звёзды и отклик на курсор.
vec3 eraCover(vec2 px, vec2 uv, vec2 a){
  float t = uTime*.05;
  vec3 col = mix(vec3(.08,.02,.14), vec3(.33,.06,.30), smoothstep(-.2, 1.1, uv.y));
  vec2 q = vec2(fbm(a*1.5 + vec2(0.0, t)), fbm(a*1.5 + vec2(3.1, -t)));
  float f = noise(a*2.2 + q*2.8 + t*2.0);
  vec3 holo = .5 + .5*cos(6.2832*(f + vec3(0.0, .3, .6)));
  holo = mix(holo, vec3(1.0, .24, .55), .45);
  holo = mix(holo, vec3(.45, 1.0, .82), smoothstep(.82, .98, f)*.5);
  col += holo*smoothstep(.48, .95, f)*.5;
  col += vec3(1.0, .24, .55)*.30*(1.0 - smoothstep(0.0, .6, length(a*vec2(.75, 1.1))));
  col += vec3(.72, .5, 1.0)*.16*(1.0 - smoothstep(0.0, .38, length(a - uMouse)));
  for(int l=0;l<2;l++){
    float fl = float(l);
    vec2 sp = a*(7.0 + fl*6.0) + vec2(t*(2.0 + fl), 0.0);
    vec2 id = floor(sp);
    vec2 g = fract(sp) - .5;
    float h = hash(id + fl*31.0);
    vec2 o = vec2(h - .5, fract(h*7.13) - .5)*.55;
    vec2 d = abs(g - o);
    float tw = .5 + .5*sin(uTime*(1.5 + h*3.0) + h*40.0);
    float star = smoothstep(.06, 0.0, d.x*d.y*24.0 + length(g - o)*.6);
    col += mix(vec3(1.0), vec3(.75, 1.0, .9), fract(h*3.7))*star*step(.62, h)*tw*(1.0 - fl*.35);
  }
  return col;
}

vec3 era(float i, vec2 px, vec2 uv, vec2 a){
  if (i < -.5) return eraCover(px, uv, a);
  if (i < .5) return eraPaper(px, uv, a);
  if (i < 1.5) return eraXerox(px, uv, a);
  if (i < 2.5) return eraBubbles(px, uv, a);
  if (i < 3.5) return eraChrome(px, uv, a);
  if (i < 4.5) return eraBokeh(px, uv, a);
  return eraSnow(px, uv, a);
}

void main(){
  vec2 px = gl_FragCoord.xy / uScale;
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 a = (gl_FragCoord.xy - .5*uRes) / uRes.y;
  float e = clamp(uEra, -1.0, 5.0);
  float i0 = floor(e);
  float k = smoothstep(0.0, 1.0, fract(e));
  vec3 col = era(i0, px, uv, a);
  if (k > .001) {
    // переход эр волной шума, а не простым кроссфейдом
    float edge = k*1.6 - .3 + (fbm(a*3.0 + uTime*.1) - .5)*.4;
    float m = smoothstep(uv.x - .08, uv.x + .08, edge);
    col = mix(col, era(i0 + 1.0, px, uv, a), m);
  }
  if (uDura > .001) {
    float band = step(.5, fract(px.y/36.0 + uTime*1.5));
    col = mix(col, vec3(1.0) - col.bgr, uDura*band);
  }
  col += (hash(gl_FragCoord.xy + fract(uTime)*100.0) - .5)*.045;
  col *= 1.0 - .25*pow(length(uv - .5)*1.2, 2.0);
  gl_FragColor = vec4(col, 1.0);
}
`

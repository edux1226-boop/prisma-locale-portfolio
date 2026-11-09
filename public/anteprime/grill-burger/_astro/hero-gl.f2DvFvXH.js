function e(e){let t=e.getContext(`webgl`,{antialias:!1,alpha:!1,powerPreference:`low-power`});if(!t)return;let n=(e,n)=>{let r=t.createShader(e);return t.shaderSource(r,n),t.compileShader(r),r},r=t.createProgram();if(t.attachShader(r,n(t.VERTEX_SHADER,`attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`)),t.attachShader(r,n(t.FRAGMENT_SHADER,`precision mediump float;
uniform vec2 uRes;uniform vec2 uMouse;uniform float uTime;uniform float uScroll;
float h(vec2 g){return fract(sin(dot(g,vec2(127.1,311.7)))*43758.5453);}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  vec2 p=(gl_FragCoord.xy-.5*uRes)/uRes.y;
  p.x-=(uMouse.x-.5)*.18;
  float hz=.04+(uMouse.y-.5)*.06;
  float c=0.;
  if(p.y<hz){
    float z=.35/(hz-p.y);
    float x=p.x*z*2.;
    float w=z+uTime*.35+uScroll*6.;
    vec2 g=abs(fract(vec2(x,w))-.5);
    float l=smoothstep(.47,.5,max(g.x,g.y));
    c+=l*exp(-z*.16)*.5;
  }
  vec2 cell=floor(uv*vec2(70.,40.)+vec2(0.,-uScroll*10.));
  float r=h(cell);
  if(r>.985){
    vec2 f=fract(uv*vec2(70.,40.)+vec2(0.,-uScroll*10.))-.5;
    float tw=.5+.5*sin(uTime*1.5+r*60.);
    c+=smoothstep(.12,.0,length(f))*tw*.45*smoothstep(hz,hz+.35,p.y);
  }
  c*=smoothstep(1.05,.2,length(uv-.5)*1.3);
  gl_FragColor=vec4(vec3(c*.85),1.);
}`)),t.linkProgram(r),!t.getProgramParameter(r,t.LINK_STATUS))return;t.useProgram(r);let i=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,i),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),t.STATIC_DRAW);let a=t.getAttribLocation(r,`p`);t.enableVertexAttribArray(a),t.vertexAttribPointer(a,2,t.FLOAT,!1,0,0);let o=e=>t.getUniformLocation(r,e),s=o(`uRes`),c=o(`uMouse`),l=o(`uTime`),u=o(`uScroll`),d=0,f=0,p=.5,m=.5,h=.5,g=.5,_=!1,v=0,y=0,b=performance.now(),x=Math.min(devicePixelRatio||1,1.25)*.75,S=()=>{d=Math.max(2,Math.round(e.clientWidth*x)),f=Math.max(2,Math.round(e.clientHeight*x)),e.width=d,e.height=f,t.viewport(0,0,d,f)},C=e=>{v=0,_&&(e-y>=33&&(y=e,p+=(h-p)*.06,m+=(g-m)*.06,t.uniform2f(s,d,f),t.uniform2f(c,p,1-m),t.uniform1f(l,(e-b)/1e3),t.uniform1f(u,Math.min(scrollY/innerHeight,3)),t.drawArrays(t.TRIANGLES,0,3)),v=requestAnimationFrame(C))},w=()=>{!v&&_&&(v=requestAnimationFrame(C))};addEventListener(`pointermove`,e=>{h=e.clientX/innerWidth,g=e.clientY/innerHeight},{passive:!0}),new ResizeObserver(S).observe(e),S(),new IntersectionObserver(([e])=>{_=e.isIntersecting&&!document.hidden,w()}).observe(e),document.addEventListener(`visibilitychange`,()=>{_=!document.hidden,w()}),e.addEventListener(`webglcontextlost`,t=>{t.preventDefault(),_=!1,e.classList.remove(`on`)}),_=!0,t.uniform2f(s,d,f),t.drawArrays(t.TRIANGLES,0,3),requestAnimationFrame(()=>e.classList.add(`on`)),w()}export{e as initHeroGL};
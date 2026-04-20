import{_ as s,o as n,c as p,ae as e}from"./chunks/framework.Czhw_PXq.js";const b=JSON.parse('{"title":"附录 B · 坐标系与变换公式","description":"","frontmatter":{},"headers":[],"relativePath":"02-opencv/appendix-coordinates-formulas.md","filePath":"02-opencv/appendix-coordinates-formulas.md"}'),l={name:"02-opencv/appendix-coordinates-formulas.md"};function i(c,a,t,o,d,h){return n(),p("div",null,[...a[0]||(a[0]=[e(`<h1 id="附录-b-·-坐标系与变换公式" tabindex="-1">附录 B · 坐标系与变换公式 <a class="header-anchor" href="#附录-b-·-坐标系与变换公式" aria-label="Permalink to &quot;附录 B · 坐标系与变换公式&quot;">​</a></h1><h2 id="b-1-坐标系" tabindex="-1">B.1 坐标系 <a class="header-anchor" href="#b-1-坐标系" aria-label="Permalink to &quot;B.1 坐标系&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>像素坐标系 (u, v):</span></span>
<span class="line"><span>  原点: 左上角 (0, 0)</span></span>
<span class="line"><span>  u = 列/宽 (向右为正)</span></span>
<span class="line"><span>  v = 行/高 (向下为正)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>相机坐标系 (X, Y, Z):</span></span>
<span class="line"><span>  原点: 相机光心</span></span>
<span class="line"><span>  Z: 光轴方向（向前为正）</span></span>
<span class="line"><span>  X: 向右</span></span>
<span class="line"><span>  Y: 向下</span></span>
<span class="line"><span></span></span>
<span class="line"><span>世界坐标系 (Xw, Yw, Zw):</span></span>
<span class="line"><span>  任意选取的参考坐标系</span></span></code></pre></div><h2 id="b-2-内参矩阵" tabindex="-1">B.2 内参矩阵 <a class="header-anchor" href="#b-2-内参矩阵" aria-label="Permalink to &quot;B.2 内参矩阵&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>K = | fx   0  cx |</span></span>
<span class="line"><span>    |  0  fy  cy |</span></span>
<span class="line"><span>    |  0   0   1 |</span></span>
<span class="line"><span></span></span>
<span class="line"><span>fx = f / dx  （焦距/像素宽 = 焦距像素单位）</span></span>
<span class="line"><span>fy = f / dy</span></span>
<span class="line"><span>cx = 主点 x</span></span>
<span class="line"><span>cy = 主点 y</span></span>
<span class="line"><span>f  = 焦距（物理单位，mm）</span></span>
<span class="line"><span>dx, dy = 像素物理尺寸</span></span></code></pre></div><h2 id="b-3-外参矩阵" tabindex="-1">B.3 外参矩阵 <a class="header-anchor" href="#b-3-外参矩阵" aria-label="Permalink to &quot;B.3 外参矩阵&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>外参 = [R | t]</span></span>
<span class="line"><span></span></span>
<span class="line"><span>R: 3×3 旋转矩阵（世界→相机）</span></span>
<span class="line"><span>t: 3×1 平移向量（世界原点→相机光心）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>[Xc]   [R | t] [Xw]</span></span>
<span class="line"><span>[Yc] =        × [Yw]</span></span>
<span class="line"><span>[Zc]              [Zw]</span></span>
<span class="line"><span>[ 1 ]              [ 1 ]</span></span></code></pre></div><h2 id="b-4-投影公式" tabindex="-1">B.4 投影公式 <a class="header-anchor" href="#b-4-投影公式" aria-label="Permalink to &quot;B.4 投影公式&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>世界点 Pw = (Xw, Yw, Zw) → 相机点 Pc = (Xc, Yc, Zc) → 像素点 p = (u, v)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>1. 世界→相机坐标:</span></span>
<span class="line"><span>   Pc = R × Pw + t</span></span>
<span class="line"><span></span></span>
<span class="line"><span>2. 透视投影:</span></span>
<span class="line"><span>   x = Xc / Zc</span></span>
<span class="line"><span>   y = Yc / Zc</span></span>
<span class="line"><span></span></span>
<span class="line"><span>3. 像素坐标:</span></span>
<span class="line"><span>   u = fx × x + cx = fx × Xc/Zc + cx</span></span>
<span class="line"><span>   v = fy × y + cy = fy × Yc/Zc + cy</span></span>
<span class="line"><span></span></span>
<span class="line"><span>矩阵形式:</span></span>
<span class="line"><span>   [u]   [fx  0  cx] [R|t] [Xw]</span></span>
<span class="line"><span>   [v] = [ 0  fy  cy] ×     × [Yw]</span></span>
<span class="line"><span>   [1]   [ 0  0   1] [ 1 ]  [Zw]</span></span>
<span class="line"><span>                          [ 1 ]</span></span></code></pre></div><h2 id="b-5-畸变模型" tabindex="-1">B.5 畸变模型 <a class="header-anchor" href="#b-5-畸变模型" aria-label="Permalink to &quot;B.5 畸变模型&quot;">​</a></h2><h3 id="径向畸变" tabindex="-1">径向畸变 <a class="header-anchor" href="#径向畸变" aria-label="Permalink to &quot;径向畸变&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>x_distorted = x (1 + k1·r² + k2·r⁴ + k3·r⁶)</span></span>
<span class="line"><span>y_distorted = y (1 + k1·r² + k2·r⁴ + k3·r⁶)</span></span>
<span class="line"><span>其中 r² = x² + y²</span></span></code></pre></div><h3 id="切向畸变" tabindex="-1">切向畸变 <a class="header-anchor" href="#切向畸变" aria-label="Permalink to &quot;切向畸变&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>x_distorted = x + [2p1·xy + p2(r² + 2x²)]</span></span>
<span class="line"><span>y_distorted = y + [p1(r² + 2y²) + 2p2·xy]</span></span></code></pre></div><h2 id="b-6-旋转向量-↔-旋转矩阵-罗德里格斯公式" tabindex="-1">B.6 旋转向量 ↔ 旋转矩阵（罗德里格斯公式） <a class="header-anchor" href="#b-6-旋转向量-↔-旋转矩阵-罗德里格斯公式" aria-label="Permalink to &quot;B.6 旋转向量 ↔ 旋转矩阵（罗德里格斯公式）&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>旋转向量 r = (rx, ry, rz), θ = ||r||</span></span>
<span class="line"><span></span></span>
<span class="line"><span>R = I + sin(θ)K + (1-cos(θ))K²</span></span>
<span class="line"><span></span></span>
<span class="line"><span>K = |  0  -rz  ry |</span></span>
<span class="line"><span>    |  rz   0  -rx |</span></span>
<span class="line"><span>    | -ry  rx   0 |</span></span></code></pre></div><h2 id="b-7-单应性矩阵-homography" tabindex="-1">B.7 单应性矩阵（Homography） <a class="header-anchor" href="#b-7-单应性矩阵-homography" aria-label="Permalink to &quot;B.7 单应性矩阵（Homography）&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>H = [h11 h12 h13]</span></span>
<span class="line"><span>    [h21 h22 h23]</span></span>
<span class="line"><span>    [h31 h32 h33]</span></span>
<span class="line"><span></span></span>
<span class="line"><span>[x&#39;]   [h11 h12 h13] [x]</span></span>
<span class="line"><span>[y&#39;] = [h21 h22 h23] [y]</span></span>
<span class="line"><span>[w&#39;]   [h31 h32 h33] [1]</span></span>
<span class="line"><span></span></span>
<span class="line"><span>u = x&#39; / w&#39;</span></span>
<span class="line"><span>v = y&#39; / w&#39;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>需要至少 4 组点对求解（最小 4 点）</span></span></code></pre></div><h2 id="b-8-基础矩阵与极线" tabindex="-1">B.8 基础矩阵与极线 <a class="header-anchor" href="#b-8-基础矩阵与极线" aria-label="Permalink to &quot;B.8 基础矩阵与极线&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>F: 基础矩阵 (3×3, 秩=2)</span></span>
<span class="line"><span>p2^T × F × p1 = 0  （对极约束）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>l = F × p  （对极线方程）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>本质矩阵 E = K^T × F × K</span></span></code></pre></div><h2 id="b-9-q-矩阵-深度→3d" tabindex="-1">B.9 Q 矩阵（深度→3D） <a class="header-anchor" href="#b-9-q-矩阵-深度→3d" aria-label="Permalink to &quot;B.9 Q 矩阵（深度→3D）&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Q = | 1  0  0 -cx |</span></span>
<span class="line"><span>    | 0  1  0 -cy |</span></span>
<span class="line"><span>    | 0  0  0  f  |</span></span>
<span class="line"><span>    | 0  0 -1/T  0 |</span></span>
<span class="line"><span></span></span>
<span class="line"><span>[x]     [Q] [u]</span></span>
<span class="line"><span>[y]  =  [ ] [v]</span></span>
<span class="line"><span>[z]     [ ] [d]  （视差）</span></span>
<span class="line"><span>[1]     [ ] [1]</span></span>
<span class="line"><span></span></span>
<span class="line"><span>其中 d = 视差 = x_left - x_right</span></span></code></pre></div><hr>`,23)])])}const u=s(l,[["render",i]]);export{b as __pageData,u as default};

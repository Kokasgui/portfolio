// Extensão programada por Jake Archibald. O presente código foi obtido no CDN https://cdn.jsdelivr.net/npm/stacked-alpha-video/+esm e ligeiramente adaptado apenas para este projeto.

/**
 * Bundled by jsDelivr using Rollup v2.79.2 and Terser v5.39.0.
 * Original file: /npm/stacked-alpha-video@1.0.10/build/index.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */

function e(e, t, n) {
    const i = e.createShader(n);
    if (!i) throw Error("Unable to create shader");
    if ((e.shaderSource(i, t), e.compileShader(i), !e.getShaderParameter(i, e.COMPILE_STATUS))) {
        const t = e.getShaderInfoLog(i);
        throw (e.deleteShader(i), Error(t || "unknown error"));
    }
    return i;
}
const t = new WeakMap();
function n(n) {
    const a = { antialias: !1, powerPreference: "low-power", depth: !1, premultipliedAlpha: !0 },
        o = n.getContext("webgl2", a) ?? n.getContext("webgl", a);
    if (!o) {
        // --------------------------------------------------- CASO WEBGL NÃO SEJA POSSÍVEL ---------------------------------------------------
        const avatar = document.querySelector("#avatar");

        // console.log(avatar.querySelector("stacked-alpha-video"));
        avatar.querySelectorAll("stacked-alpha-video").forEach((customElement) => {
            customElement.remove();
        });

        throw Error("Couldn't create GL context");
    }
    const r = (function (e, t) {
        const n = e.createProgram();
        if (!n) throw Error("Unable to create program");
        for (const i of t) e.attachShader(n, i);
        if ((e.linkProgram(n), !e.getProgramParameter(n, e.LINK_STATUS))) {
            const t = e.getProgramInfoLog(n);
            throw (e.deleteProgram(n), Error(t || "unknown error"));
        }
        return n;
    })(o, [
        e(
            o,
            "\nprecision mediump float;\n\n// our textures\nuniform sampler2D u_frame;\n\n// data\nuniform float u_premultipliedAlpha;\n\n// the texCoords passed in from the vertex shader.\nvarying vec2 v_texCoord;\n\nvoid main() {\n  // Calculate the coordinates for the color and alpha\n  vec2 colorCoord = vec2(v_texCoord.x, v_texCoord.y * 0.5);\n  vec2 alphaCoord = vec2(v_texCoord.x, 0.5 + v_texCoord.y * 0.5);\n\n  vec4 color = texture2D(u_frame, colorCoord);\n  float alpha = texture2D(u_frame, alphaCoord).r;\n\n  gl_FragColor = vec4(color.rgb * mix(alpha, 1.0, u_premultipliedAlpha), alpha);\n}\n",
            o.FRAGMENT_SHADER,
        ),
        e(
            o,
            "\nprecision mediump float;\nattribute vec2 a_position;\nuniform mat3 u_matrix;\nvarying vec2 v_texCoord;\n\nvoid main() {\n  gl_Position = vec4(u_matrix * vec3(a_position, 1), 1);\n\n  // because we're using a unit quad we can just use\n  // the same data for our texcoords.\n  v_texCoord = a_position;\n}\n",
            o.VERTEX_SHADER,
        ),
    ]);
    o.useProgram(r);
    const s = o.getAttribLocation(r, "a_position"),
        l = o.getUniformLocation(r, "u_frame");
    o.uniform1i(l, 0);
    const d = o.getUniformLocation(r, "u_matrix");
    (t.set(o, o.getUniformLocation(r, "u_premultipliedAlpha")), i(o, !1));
    const c = o.createBuffer(),
        h = new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]);
    (o.bindBuffer(o.ARRAY_BUFFER, c),
        o.bufferData(o.ARRAY_BUFFER, h, o.STATIC_DRAW),
        o.enableVertexAttribArray(s),
        o.vertexAttribPointer(s, 2, o.FLOAT, !1, 0, 0),
        o.uniformMatrix3fv(d, !1, [2, 0, 0, 0, -2, 0, -1, 1, 1]));
    const u = o.createTexture();
    return (
        o.bindTexture(o.TEXTURE_2D, u),
        o.texParameteri(o.TEXTURE_2D, o.TEXTURE_WRAP_S, o.CLAMP_TO_EDGE),
        o.texParameteri(o.TEXTURE_2D, o.TEXTURE_WRAP_T, o.CLAMP_TO_EDGE),
        o.texParameteri(o.TEXTURE_2D, o.TEXTURE_MIN_FILTER, o.NEAREST),
        o.texParameteri(o.TEXTURE_2D, o.TEXTURE_MAG_FILTER, o.NEAREST),
        o
    );
}
function i(e, n) {
    e.uniform1f(t.get(e), n ? 1 : 0);
}
const a = new CSSStyleSheet();
a.replaceSync(
    "\n  :host {\n    display: inline-block;\n    height: inherit;\n  }\n\n  canvas {\n    display: inherit;\n    width: inherit;\n    object-fit: inherit;\n    aspect-ratio: inherit;\n    height: inherit;\n }\n\n @media screen and (max-width: 700px) { canvas { width: 100%; }}",
);
class o extends HTMLElement {
    static observedAttributes = ["premultipliedalpha"];
    #e = this.attachShadow({ mode: "closed" });
    #t = document.createElement("canvas");
    #n = null;
    #i = null;
    constructor() {
        (super(),
            (this.#e.adoptedStyleSheets = [a]),
            this.#e.append(this.#t),
            new IntersectionObserver(([e]) => {
                this.#a({ intersecting: e.isIntersecting });
            }).observe(this),
            new MutationObserver(() => {
                this.firstElementChild !== this.#i && this.#o(this.firstElementChild);
            }).observe(this, { childList: !0 }),
            this.#o(this.firstElementChild));
    }
    #r = 0;
    #s = () => {
        if (this.#i) {
            if (!this.#n) {
                (this.#t.remove(), (this.#t = document.createElement("canvas")), this.#e.append(this.#t));
                try {
                    this.#n = n(this.#t);
                } catch (e) {
                    console.warn("<stacked-alpha-video> Couldn't create GL context");

                    // // --------------------------------------------------- CASO WEBGL NÃO SEJA POSSÍVEL ---------------------------------------------------
                    // const avatar = document.querySelector("#avatar");
                    // const canvas = avatar.querySelector("canvas");

                    // if (!canvas) {
                    //     const img = document.createElement("img");

                    //     img.src = "./assets/images/avatar.png";
                    //     img.alt = "Avatar de Guilherme Costa";

                    //     avatar.appendChild(img);
                    //     avatar.querySelector("stacked-alpha-video").remove();
                    // }
                }
                if (!this.#n) return;
                i(this.#n, this.premultipliedAlpha);
            }
            (!(function (e, t) {
                const n = e.canvas,
                    i = t.videoWidth,
                    a = Math.floor(t.videoHeight / 2);
                ((n.width === i && n.height === a) || ((n.width = i), (n.height = a), e.viewport(0, 0, i, a)),
                    e.texImage2D(e.TEXTURE_2D, 0, e.RGBA, e.RGBA, e.UNSIGNED_BYTE, t),
                    e.drawArrays(e.TRIANGLES, 0, 6));
            })(this.#n, this.#i),
                this.#l.videoPlaying && (this.#r = requestAnimationFrame(this.#s)));
        }
    };
    #l = { videoPlaying: !1, intersecting: !1, connected: !1 };
    #d = !1;
    #a(e) {
        (Object.assign(this.#l, e),
            this.#d ||
                ((this.#d = !0),
                queueMicrotask(() => {
                    this.#d = !1;
                    const { connected: e, intersecting: t } = this.#l;
                    (cancelAnimationFrame(this.#r),
                        e && t
                            ? (this.#r = requestAnimationFrame(this.#s))
                            : this.#n && (this.#n.getExtension("WEBGL_lose_context")?.loseContext(), (this.#n = null)));
                })));
    }
    #c = null;
    #o(e) {
        if ((this.#c && this.#c.abort(), e && !(e instanceof HTMLVideoElement)))
            return (console.warn("<stacked-alpha-video> Child must be a <video>"), (this.#i = null), void this.#a({ videoPlaying: !1 }));
        if (((this.#i = e), !e)) return void this.#a({ videoPlaying: !1 });
        e.autoplay &&
            setTimeout(() => {
                e.play();
            }, 0);
        const t = () => {
            var t;
            this.#a({ videoPlaying: ((t = e), !t.paused && !t.ended && t.readyState > 2) });
        };
        (t(), (this.#c = new AbortController()));
        const n = this.#c.signal;
        for (const i of ["playing", "stalled", "emptied", "ended", "pause"]) e.addEventListener(i, t, { signal: n });
    }
    connectedCallback() {
        this.#a({ connected: !0 });
    }
    disconnectedCallback() {
        this.#a({ connected: !1 });
    }
    attributeChangedCallback(e, t, n) {
        if ("premultipliedalpha" === e) {
            if (!this.#n) return;
            i(this.#n, null !== n);
        }
    }
    get premultipliedAlpha() {
        return this.hasAttribute("premultipliedalpha");
    }
    set premultipliedAlpha(e) {
        e ? this.setAttribute("premultipliedalpha", "") : this.removeAttribute("premultipliedalpha");
    }
}
customElements.define("stacked-alpha-video", o);
export { o as default };
//# sourceMappingURL=/sm/2b6893158f09be0788d7399a4d6130a7442c475832a1b05b3914306179977d12.map

# The Vibe Coding Test: What Happens When the AI Breaks Its Own Code

**By Ronald Brady | August 23, 2026**

---

Let me tell you about an experiment I ran.

It wasn't a lab thing. I'm not submitting it to a journal, and if I tried, people with actual methodology training would probably laugh at me. But here's why I'm telling you about it anyway.

I replicated the exact conditions that the whole vibe coding revolution is selling you.

You've seen the ads. "I built a full-stack app in 20 minutes with AI." "Developers are obsolete." "Just describe what you want and it builds it." I wanted to know what happens when you actually do that. Not when it works. We've all seen the demos where it works. I wanted to see what happens on iteration three. When the model hits its own limits, breaks its own code, and the person using it has to figure out what to do next.

So I did it. I described what I wanted. Let the AI build it. Watched what happened.

I need to tell you what I found.

---

**The Setup**

I was working on a Three.js scene. A rainy night intersection. Moody. Atmospheric. The kind of thing you'd use as a loading screen or a background for a VTT session. Nothing that required architectural brilliance. Camera controls. Rain. Some buildings. A traffic light. A car.

I started in OxAlpha's web portal. Free tier, frontier-adjacent model. I told it what I wanted, and it produced code. I saved each iteration as its own HTML file, untouched. The experiment was clean that way. No cherry-picking. No manual polish. Just file by file, what the model produced when I told it what to build.

**Iteration 1: it worked.**

Simple intersection. Fog. WASD movement and mouse look. A road with lane markings. Four buildings. One car running a red light. Rain. A neon sign that flickers.

No textures. Flat colors. No audio. No sidewalks. But it was complete, and it ran. Straight through, no errors.

The code was straightforward. A single `building()` function that creates a box and scatters windows on the front face:

```javascript
function building(x, z, w, h, d, color) {
  const b = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.2 }),
  );
  b.position.set(x, h / 2, z);
  scene.add(b);

  const winMat = new THREE.MeshBasicMaterial({ color: 0xffb347 });
  for (let wy = 2; wy < h - 1; wy += 2)
    for (let wx = -w / 2 + 1; wx < w / 2 - 0.5; wx += 1.5) {
      if (Math.random() < 0.55) {
        const win = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 1), winMat);
        win.position.set(x + wx, wy, z + d / 2 + 0.02);
        scene.add(win);
      }
    }
  return b;
}
```

One function. Loops. Math. It worked. This is what the AI is actually good at. Generating straightforward code from a clear description.

**Iteration 2: it worked better.**

I asked for more. The model added audio. A procedural rain texture using Web Audio API, with a highpass filter at 900Hz and a lowpass at 7kHz, modulated by an LFO running at 0.13Hz that wobbles the gain. A synth pad with four notes and detuned sawtooth oscillators, filtered through a lowpass with its own LFO sweep. A random bell tone that rings every 4 seconds.

That's a lot of words describing something the model generated correctly on the first try. The filter frequencies were specific. The LFO rates were specific. They all worked. I ran the file and heard rain.

It added procedural textures. Canvas-generated. Wet asphalt with speckle and cracks. Concrete sidewalk with tile seams. Brick facades with lit windows baked in. All generated at runtime from noise functions.

```javascript
function canvasTex(draw, w = 256, h = 256, repeat = [4, 4]) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...repeat);
  return t;
}
```

The asphalt texture alone has 2,600 random speckles, 10 crack lines with random branches, and subtle surface noise:

```javascript
const asphaltTex = canvasTex(
  (g, w, h) => {
    g.fillStyle = "#14161d";
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) {
      g.fillStyle = `rgba(${(30 + Math.random() * 40) | 0},
      ${(32 + Math.random() * 40) | 0},
      ${(38 + Math.random() * 45) | 0},
      ${Math.random() * 0.35})`;
      g.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5);
    }
    g.strokeStyle = "rgba(8,8,10,0.7)";
    for (let i = 0; i < 10; i++) {
      g.beginPath();
      let x = Math.random() * w,
        y = Math.random() * h;
      g.moveTo(x, y);
      for (let s = 0; s < 8; s++) {
        x += (Math.random() - 0.5) * 40;
        y += (Math.random() - 0.5) * 40;
        g.lineTo(x, y);
      }
      g.lineWidth = Math.random() * 1.5;
      g.stroke();
    }
  },
  256,
  256,
  [8, 8],
);
```

It added crosswalks. Curb cuts on two corners for wheelchair access. A traffic light with a real cycle. Four cars in two lanes with state machines. Rain splash ripples.

200-plus lines of interdependent code across multiple subsystems. Audio, textures, physics, state machines. All generated in a single pass. All working.

This is the part they show you in the demo.

**Iteration 3: it broke.**

I pushed further. Reflective puddles. Holographic billboards with animated shaders. More cars, more complex traffic logic.

The model hit its response length limit.

If you've used these tools for any length of time, you know exactly what that means. The model's output window fills up, and it starts truncating its own response. The code starts looking right without being right. Syntax is plausible. Structure is familiar. But something is wrong, and the model can't tell you what, because it doesn't understand the code it just wrote. It pattern-matched it into existence. When the context window runs out, the pattern breaks.

Here's what iteration 3 was generating before it broke. Reflective puddles using Three.js's Reflector:

```javascript
import { Reflector } from "https://unpkg.com/three@0.160.0/examples/jsm/objects/Reflector.js";

function addPuddle(x, z, rw, rh, rotY = 0) {
  const geo = new THREE.CircleGeometry(1, 32);
  geo.scale(rw, rh, 1);
  const refl = new Reflector(geo, {
    clipBias: 0.003,
    textureWidth: 1024,
    textureHeight: 1024,
    color: 0x8899aa,
  });
  refl.rotation.x = -Math.PI / 2;
  refl.position.set(x, 0.008, z);
  scene.add(refl);
}
```

And holographic billboards with animated scanlines, glitch displacement, and scrolling text rendered entirely in shader code:

```javascript
const holoUniforms = [];
function holoBillboard(x, y, z, w, h, rotY, colorA, colorB, speed) {
  const uni = {
    uTime: { value: 0 },
    uColA: { value: new THREE.Color(colorA) },
    uColB: { value: new THREE.Color(colorB) },
    uSpeed: { value: speed },
    uGlitch: { value: 0 },
  };
  holoUniforms.push(uni);
  // ... full GLSL shader material
}
```

The code looks right. The imports are correct. The uniform setup is clean. The Reflector pattern is standard. But somewhere in 160,000-plus characters of generated output, something broke. I don't know exactly what. The model knew. It showed me the error in the chat panel. It generated the corrected version. But it couldn't apply the fix. It couldn't look at its own output, find the broken line, and change it.

The model knew the error. It could describe the error. It generated the corrected code. But it couldn't make the edit. Because that requires holding the entire program in mind, tracing the data flow, finding the contradiction, and resolving it. That's not a token prediction problem. That's a comprehension problem, and the model doesn't have comprehension.

---

**The agent test**

I installed Cline. The VS Code agent everyone points to now. Connected it to the same model through OpenRouter. Gave it iteration 3 and a partial fix. Fix the error, I said.

It couldn't. It tried. Spun its wheels for a while. Made suggestions that almost worked. And then it did something I didn't ask for.

It refactored the whole thing.

Changed variable names. Restructured functions. Reorganized control flow. Made the code unrecognizable.

```javascript
// What I gave it:
carStates[i].timer += dt;
if (st.state === "approach") {
  car.position.z += lane.dir * 6 * dt;
  const atLine = lane.dir > 0 ? car.position.z >= -8 : car.position.z <= 8;
}

// What it turned into: something completely different.
// New variable names. New function boundaries. Logic moved around.
```

Now I have a different problem. Even if I wanted to manually paste in the correction the model showed me in the chat, I can't. The code doesn't look like what I started with. The variable names are gone. The structure rearranged itself. The agent made itself the only thing that understands this codebase, except it doesn't understand it either. It generated it through pattern completion.

This is the thing I keep coming back to. Not the automation. The entanglement. Code that no human fully understands because it was built by a machine that doesn't understand it either. Layers on top of layers. Nobody at the wheel. And when it breaks, there's no one to call.

---

**The gap**

I'm not saying this makes AI useless. I'd be a hypocrite if I did. I used the model to write the scene in the first place. I still use this stuff every day. I have cerebral palsy. Typing is hard. Voice dictation is my daily driver. AI that turns natural language into working programs is a genuine accessibility tool.

But there's a difference between using a tool and trusting a tool. And the difference is whether you can read what it produced.

If you don't know how to read the code, you're not coding. You're gambling. Each iteration is a pull of the lever. Sometimes you win. Sometimes the output breaks, and you don't know why, and you can't fix it. So you start over and hope the next pull doesn't break too.

That's vibe coding. And vibe coding works great until it doesn't, and when it doesn't, the person using it has nothing to fall back on.

The model generated 200 lines of working audio code on the first try. It generated four cars with state machines. It generated reflective puddles and holographic shaders. And then it broke its own code and couldn't fix it. All of those things are true about the same tool, the same model, the same session.

---

**The thing that bothers me**

It's not that executives think AI will replace developers. Let them think that. They've been wrong about technology before.

What bothers me is the entanglement. Code that passes review because nobody understands it well enough to say it's wrong. Features that ship because nobody can trace the full data flow. A codebase that grows in a direction nobody chose because every layer was half-generated by a model that doesn't understand the layer beneath it.

I don't know where that ends. But I know it doesn't end well.

---

**So where does this leave me?**

I don't have a good answer for what tool to use instead. Continue got bought and shut down. The space has fractured into agents that won't autocomplete and autocomplete that won't agent, and nobody's built the one thing that does both with your own API key. I've been looking. It doesn't exist.

So for now I'm using the web portal for what it's good at. Starting things. And doing the rest the old way. Reading what it produced. Finding the bugs. Pasting the fixes. Actually understanding what the machine made before I trust it.

It's slower. But when iteration four breaks, I'll know how to fix it.

And if you're reading this and you don't know how to read code, and you're relying on AI to write it for you, I'm not telling you to stop. I'm telling you to learn what the machine is doing before you trust it completely. Because at some point, it will break, and when it does, you need to be able to look at the output and recognize what went wrong.

---

_If you got something out of this, share it. If you think I'm wrong, tell me. That's the point. We need to be honest about what this stuff can actually do, because the hype is drowning out the reality and people are making decisions based on ads, not evidence._

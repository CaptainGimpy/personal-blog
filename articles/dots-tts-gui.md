# Whatever the Hell a Dots TTS GUI Is and Why It Exists

**By Ronald Brady | August 31, 2026**

---

Alright, so I built a thing. It's a Gradio wrapper for Dots TTS, which is a 2-billion parameter voice cloning model that can take a sample of someone's voice and generate new speech that sounds like them. That part already existed. What didn't exist was a way to use it for anything longer than one sentence.

Here's the thing about these models. They're trained on short clips. A few seconds. Maybe ten if you're lucky. The model itself has a hard cap at 500 patches internally, which works out to about 80 seconds of total generation if you're starting from scratch. But if you feed it a reference clip for voice cloning, that eats into the budget. The model has to encode your reference into the pipeline, and every second of reference audio you give it is a second it can't spend generating the output.

So you give it a 67-second reference clip — which is what you'd want for actually decent voice cloning, because nobody's voice is fully represented in ten seconds of audio — and suddenly your budget for actually generating speech drops to like 13 seconds. Your three-sentence intro gets cut off mid-word and the model acts like it's done. No error. No warning. It just stops.

This is a model architecture problem, not something I could fix by writing better code. The internal bucket list that controls how many audio patches the model can generate topped out at 512. I extended it to 2048. That's about five minutes of generation. Enough for actual use.

There's also the reference audio cap. The model's default config limits how much of your reference clip it actually processes for voice cloning. If you give it a minute-long recording, it crops to a random ten-second slice. Every generation rolls the dice on which slice it gets, so your cloned voice sounds different every time. I set that to unlimited.

The early stopping was another one. The model has an end-of-speech detector that's supposed to decide when the generated audio has said enough and stop. Default threshold is 0.8, meaning when it's 80% confident the text is done, it cuts. In practice this means it cuts way early for anything with natural pauses or inflection. I bumped it to 0.99. Haven't had a truncated generation since.

And of course there was the 24kHz fiasco. The model runs at 48kHz. I saved the output at 24kHz. That doubles the playback length and makes everything sound like a slow-talking robot. I don't have a good excuse for that one. I just guessed wrong and didn't check.

So the GUI itself sits on top of all this. Gradio frontend with a dark theme, a text box, a voice selector, speaker scale slider, chunk size and overlap controls. The long-form pipeline splits text on sentence boundaries into chunks, generates each one with the full reference clip and crossfade stitching, and outputs a single audio file. You can upload new voice profiles on the fly.

The chunking respects abbreviations. Dr., Mr., U.S., etc. Those tripped up the first version. Fun fact about regex.

Why build it at all? Because the original Dots TTS demo doesn't handle long text and there wasn't a wrapper that did. Voice cloning is useful if you want to generate audiobook samples, narration, or just mess around with what your voice sounds like reading things you didn't actually say. I wanted a tool that did that without fighting the model's defaults at every step.

So here it is. https://github.com/CaptainGimpy/dots-tts-gui

The README covers the setup and the three model patches are documented there too. If you're on Windows you'll need the pynini workaround because that dependency doesn't compile on MSVC and apparently that's my problem now. Whatever. It works.

The model config edits are in the code as patched constants. If the upstream repo ever updates them, the GUI won't pick those up automatically because it modifies the installed package at the site-packages level. That's not great practice but it's honest work. If I ever package this properly I'll fix that. For now it works, it's on GitHub, and if someone else finds it useful that's a bonus.
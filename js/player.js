function Filmteractive(id, scenario, options) {

    class Stage extends HTMLElement {

        constructor() {
            super();
            this.count = 2
            this.index = 0;

            this.next_scene = null;
            this.static = null;

            this.buffers = [];
            this.sources = [];

            this.attachElements();
        }

        attachElements() {
            this.attachStatic();
            this.attachBuffers();
        }

        attachBuffers() {
            for (let i = 0; i < this.count; i++) {
                const video_buffer = document.createElement("video");
                const video_source = document.createElement("source");
                video_source.setAttribute("type", "video/mp4");
                video_source.setAttribute("src", "");

                video_buffer.id = `stage-buffer-${i}`;
                video_buffer.crossOrigin = "";
                video_buffer.playsInline = true;
                video_buffer.WebKitPlaysInline = true;
                video_buffer.preload = "none";
                video_buffer.poster = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAJEAAAAABO0S+tAAAADUlEQVQY02NgGAVEAQABKQABQ8duRgAAAABJRU5ErkJggg==";
                video_buffer.appendChild(video_source);
                video_buffer.removeAttribute("controls");

                video_buffer.addEventListener("canplaythrough", (evt) => {
                    if (this.next_scene && this.isCurrent(evt.target)) {
                        this.preload();
                    }
                });

                video_buffer.addEventListener("timeupdate", (evt) => {
                    this.dispatchEvent(new evt.constructor(evt.type, evt));
                    const buffer = evt.target;
                    if (this.isCurrent(buffer) && (buffer.currentTime >= buffer.duration)) {
                        buffer.pause();
                        const event = document.createEvent('Event');
                        event.initEvent("current-buffer-ended", true, true);
                        this.dispatchEvent(event);
                    }
                })

                this.sources.push(video_source);
                this.buffers.push(video_buffer);
            }
            this.append(...this.buffers);
        }

        attachStatic() {
            this.static = document.createElement("img");
            this.static.id = "stage-poster";
            this.static.crossOrigin = "";
            this.appendChild(this.static);
        }

        init() {
            this.sources.forEach(source => source.setAttribute("src", video_path + "blank.mp4"))
            this.buffers.forEach(buffer => buffer.play());
        }

        showStatic() {
            this.static.classList.add("current");
        }

        hideStatic() {
            this.static.classList.remove("current");
            this.static.src = poster_null;
        }

        isCurrent(buffer) {
            return buffer.id === this.currentBuffer.id;
        }

        get currentTime() {
            return this.currentBuffer.currentTime;
        }

        set currentTime(time) {
            this.currentBuffer.currentTime = time;
        }

        setPoster(poster) {
            this.currentBuffer.poster = poster;
            this.nextBuffer.classList.remove("current");
            this.currentBuffer.classList.add("current");
        }

        play() {
            this.currentBuffer.play().catch(() => {
                ignore_click = true;
                stage.setPoster("assets/messenger_play.png");
                window.addEventListener("touchstart", function temp() {
                    stage.play();
                    stage.setPoster("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAJEAAAAABO0S+tAAAADUlEQVQY02NgGAVEAQABKQABQ8duRgAAAABJRU5ErkJggg==");
                    window.removeEventListener("touchstart", temp)
                    ignore_click = false;
                })
            });
            const rest_buffers = this.buffers.filter((_, i) => i !== this.index);
            this.currentBuffer.addEventListener("timeupdate", function handle(e) {
                if(e.target.currentTime) {
                    e.target.classList.add("current");
                    rest_buffers.forEach((buffer) => buffer.classList.remove("current"));
                    e.target.removeEventListener("timeupdate", handle);
                }
            })
        }

        increment() {
            this.index = ++this.index % this.count;
        }

        get currentBuffer() {
            return this.buffers[this.index];
        }

        get nextBuffer() {
            return this.buffers[(this.index + 1) % this.count];
        }

        get currentSource() {
            return this.sources[this.index];
        }

        get nextSource() {
            return this.sources[(this.index + 1) % this.count];
        }

        get contentDimensions() {
            if (this.currentBuffer.classList.contains("current")) {
                const ew = this.currentBuffer.offsetWidth;
                const eh = this.currentBuffer.offsetHeight;
                const sw = this.currentBuffer.videoWidth;
                const sh = this.currentBuffer.videoHeight;
                const sar = sw / sh;
                const ear = ew / eh;

                if(ear > sar)  return [eh * sar, eh];
                else if(ear < sar)  return [ew, ew / sar];
                else return [ew, eh];

            } else return [this.static?.width, this.static?.height];
        }

        get paused() {
            return this.currentBuffer.paused;
        }

        setStatic(poster) {
            this.static.src = poster;
        }

        setScene(scene) {
            const src = video_path + scene.vsrc;
            if (this.nextSource.getAttribute("src") !== src) {
                this.nextSource.setAttribute("src", src);
                this.nextBuffer.dataset.loading = "0";
                this.nextBuffer.volume = scene.volume || 1;
            }

            if (this.nextBuffer.dataset.loading === "0") {
                this.nextBuffer.load();
                this.nextBuffer.dataset.loading = "1";
            }

            this.next_scene = scene.onend;

            this.increment();
        }

        preload() {
            const scene = scenario.scenes[this.next_scene?.scene || this.next_scene];

            function load() {
                if(scene) {
                    stage.nextSource.setAttribute("src", video_path + scene.vsrc);
                    stage.nextBuffer.load();
                    stage.nextBuffer.currentTime = stage.next_scene?.time -.1 || 0;
                    stage.nextBuffer.dataset.loading = "1";
                }
            }

            if(this.currentBuffer.paused) {
                this.currentBuffer.addEventListener("timeupdate", function handle(e) {
                if(e.target.currentTime) {
                    load()
                    e.target.removeEventListener("timeupdate", handle);
                }
            })
            } else{
                load();
            }
        }
    }

    class SoundBite {
        secondary = false;

        constructor(opts) {
            this.evt = opts;
            this.opts = this.evt.sound;
            this.secondary = opts.secondary;
            this.audio = this.src.startsWith(audio_path + "bg") ? audio_music : audio_delay;
            this.audio.src = this.src;
            this.audio.loop = this.opts.loop || false;
            this.audio.volume = this.opts.volume || 1;
            this.load();
            const bound_onend = this.onend.bind(this);
            this.audio.addEventListener("ended", bound_onend)
        }

        load() {
            this.audio.load();
        }

        play() {
            this.audio.play().then(() => {}).catch(() => {});
        }

        kill() {
            this.audio.pause();
            this.audio.removeAttribute("src");
            this.audio.load();
            this.audio = null;
        }

        onend() {
            const onend = this.opts.onend || false;
            if (!onend) {
                return;
            }
            if (onend?.type === "repeat") {
                const timeout = onend?.timeout || this.evt.span;
                EventStack.instance.push(Object.assign({}, this.evt, {span: timeout, unbound: onend?.unbound || false}));
            }
        }

        dipIf(test, duration, volume) {
            if (this[test]) {
                this.dip(duration, volume);
            }
        }

        dip(duration, volume) {
            const volume_orig = this.audio.volume;
            this.audio.volume = volume;
            setTimeout(() => this.audio.volume = volume_orig, duration);
        }

        set volume(value) {
            this.audio.volume = value;
        }

        get playing() {
            return !this.audio.paused
        }

        get src() {
            if (!Array.isArray(this.opts.src)) {
                return audio_path + this.opts.src;
            }
            return audio_path + this.opts.src[this.opts.src.length * Math.random() | 0];
        }
    }

    class AudioStack {

        static get instance() {
            if (!audioStack) {
                audioStack = new AudioStack();
            }
            return audioStack;
        }

        constructor() {
            this.data = [];
        }

        kill(audio_index) {
            this.data[audio_index].kill();
            this.data[audio_index] = false;
            return this.data[audio_index];
        }

        push(opts) {
            return this.data.push(new SoundBite(opts)) - 1;
        }

        runEach(func, args = null) {
            this.data.forEach(soundbite => soundbite && soundbite[func](...args));
        }

        killAll() {
            this.data.forEach(soundbite => soundbite && soundbite.kill())
        }
    }

    class HitBox {

        constructor(constraints) {
            this.element = document.createElement("div");
            this.element.className = "stage-hitbox";
            this.dimensions = constraints?.hitbox;
            if(constraints?.timespan) {
                const bound_attachBox = this.attachBox.bind(this);
                stage.addEventListener("timeupdate", function handler() {
                    // Race condition very ugly fix
                    if(stage.contentDimensions[0] === 16 && stage.contentDimensions[1] === 9) {
                        return;
                    }
                    if(stage.currentTime >= constraints.timespan) {
                        stage.removeEventListener("timeupdate", handler);
                        bound_attachBox();
                    }
                });
            } else {
                this.attachBox();
            }
        }

        attachBox() {
            stage.appendChild(this.element);
            this.setDimensions();
            this.element.addEventListener("click",(e) => {
                audio_hit.play();
                e.hit = true;
            });
            new ResizeObserver(this.setDimensions.bind(this)).observe(stage);
        }

        setDimensions() {
            if(! this.element) {
                return;
            }
            if(typeof this.dimensions === "undefined") {
                this.dimensions = ["0", "100", "100", "0"];
            }

            const vw = stage.clientWidth;
            const vh = stage.clientHeight;

            const [cw, ch] = stage.contentDimensions;
            const wp = (cw / vw);
            const hp = (ch / vh);
            const mxp = ((vw - cw) / vw) * 50;
            const myp = ((vh - ch) / vh) * 50;

            const top = (this.dimensions[0] * hp) + myp;
            const right = (this.dimensions[1] * wp) + mxp;
            const bottom = (this.dimensions[2] * hp) + myp;
            const left = (this.dimensions[3] * wp) + mxp;

            this.element.style.top =`${top}%`;
            this.element.style.left = `${left}%`;
            this.element.style.width = `${right - left}%`
            this.element.style.height = `${bottom - top}%`;
        }

        detachBox() {
            this.element.remove();
            this.element = null;
        }
    }

    class Event {

        constructor(opts) {
            this.opts = opts;
            this.hitbox = false;
            this.delete_me = false;
            this.timeout = false;
            this.audio_index = false;

            this.handler = this.activate.bind(this);

            if(this.opts?.unbound || ! stage.currentBuffer.paused ) this.init();
            else {
                const bound_init = this.init.bind(this);
                stage.currentBuffer.addEventListener("play", bound_init);
            }
        }

        sceneComplies(scene_id, key) {
            scene_id = scene_id?.scene || scene_id;
            if (typeof this.opts[key] === "undefined" || typeof scene_id === "undefined") {
                return false
            } else if (Array.isArray(this.opts[key])) {
                return this.opts[key].includes(scene_id);
            } else if (this.opts[key].startsWith) {
                return scene_id.startsWith(this.opts[key].startsWith);
            } else if (this.opts[key].endsWith) {
                return scene_id.endsWith(this.opts[key].endsWith);
            } else return false;
        }

        emerge(scene_id) {
            if (this.sceneComplies(scene_id, "emergeOn")) {
                this.init();
            }
        }

        init() {
            switch (true) {
                case this.opts.type === "click" :
                    this.hitbox = new HitBox(this.opts?.constraints);
                    stage.addEventListener(this.opts.type, this.handler);
                    break;
                case this.opts.type === "timeout" :
                    this.timeout = setTimeout(this.handler, this.opts.span);
                    break;
            }
        }

        insideHitbox(evt) {
            const vw = stage.clientWidth;
            const vh = stage.clientHeight;
            const [cw, ch] = stage.contentDimensions;
            const [mw, mh] = [(vw - cw) / 2, (vh - ch) / 2]

            const ht = (ch / 100) * this.opts.constraints.hitbox[0];
            const hr = (cw / 100) * this.opts.constraints.hitbox[1];
            const hb = (ch / 100) * this.opts.constraints.hitbox[2];
            const hl = (cw / 100) * this.opts.constraints.hitbox[3];

            const cr = stage.getBoundingClientRect();
            const [ex, ey] = [evt.clientX - (cr.left + mw), evt.clientY - (cr.top + mh)];

            return ey >= ht
                && ex <= hr
                && ey <= hb
                && ex >= hl;
        }

        shouldRun(evt) {
            if (this.opts.constraints === undefined) {
                return true
            }
            let run = true;
            if (this.opts.constraints.hitbox !== undefined) {
                run &= this.insideHitbox(evt)
            }
            if (this.opts.constraints.timespan !== undefined) {
                run &= stage.currentTime >= this.opts.constraints.timespan[0];
                if (this.opts.constraints.timespan[1]) {
                    run &= stage.currentTime <= this.opts.constraints.timespan[1];
                }
            }
            return run;
        }

        activate(evt = false) {
            if (!this.shouldRun(evt)) {
                return;
            }
            if (evt && evt.type === "click" && this.opts.hitbox && !this.insideHitbox(evt)) {
                return;
            }
            if (this.opts.sound) {
                this.audio_index = AudioStack.instance.push(this.opts);
                AudioStack.instance.data[this.audio_index].play()
            }
            if (this.opts.scene) {
                director.setScene(this.opts.scene);
            }
        }

        killAudio() {
            if (this.audio_index !== false) {
                this.audio_index = AudioStack.instance.kill(this.audio_index);
            }
        }

        abort() {
            switch (true) {
                case this.opts.type === "click" :
                    this.hitbox.detachBox();
                    stage.removeEventListener(this.opts.type, this.handler)
                    break;
                case this.opts.type === "timeout" :
                    clearTimeout(this.timeout);
            }
            this.killAudio();
            return true;
        }

        setDeleteMe(scene_id) {
            this.delete_me = !this.sceneComplies(scene_id, "scene_span");
        }

        updateSceneId(scene_id) {
            if (this.opts.global) {
                this.emerge(scene_id)
            } else {
                this.setDeleteMe(scene_id);
            }
            return !(this.delete_me && this.abort());
        }
    }

    class EventStack {

        static get instance() {
            if (!eventStack) {
                eventStack = new EventStack();
            }
            return eventStack;
        }

        constructor() {
            this.data = [];
        }

        push(opts) {
            if (opts.single && this.has(opts)) {
                return;
            }
            this.data.push(new Event(opts));
        }

        update(scene_id) {
            this.data = this.data.filter(event => event && event.updateSceneId(scene_id));
        }

        has(opts) {
            return this.data.some((evt) => { return evt.opts === opts});
        }
    }

    class Director {

        constructor() {
            const bound_ended = this.ended.bind(this);
            stage.addEventListener("current-buffer-ended", bound_ended);
            this.addEvents(scenario.events.map(evt => ({...evt, global: true})));
            this.setScene(window.location.hash.replace("#", "") || scenario.enter)
            this.wakeLock();
        }

        async wakeLock() {
            this.lock = null;
            if ('wakeLock' in navigator) {
                try {
                    this.lock = await navigator.wakeLock.request('screen');
                } catch (err) {
                    console.log(`${err.name}, ${err.message}`);
                }
            }
        }

        ended() {
            if (this.scene.onend) {
                this.setScene(this.scene.onend?.scene || this.scene.onend);
            } else if (this.scene?.last === true && this.lock) {
                this.lock.release().then(() => this.lock = null)
            }
        }

        setScene(scene_id) {
            window.location.href = `#${scene_id}`;
            EventStack.instance.update(scene_id);
            this.scene = scenario.scenes[scene_id];
            this.act();
        }

        act() {
            stage.setScene(this.scene);
            if (this.scene.poster) {
                const image = typeof (this.scene.poster) === "object" ? this.scene.poster.image : this.scene.poster;
                const sound = this.scene.poster.sound;

                stage.setStatic(image)
                if (sound) {
                    this.addEvents([{
                        "type": "timeout",
                        "span": 1,
                        "sound": {
                            "src": sound
                        }
                    }]);
                }
                stage.addEventListener("click", function handle() {
                    stage.play();
                    stage.hideStatic();
                    director.addEvents(director.scene.events);
                    stage.removeEventListener("click", handle)
                });
            } else {
                stage.setStatic(poster_null);
                stage.play();
                stage.hideStatic();
                this.addEvents(this.scene.events);
            }
        }

        addEvents(events = []) {
            events.forEach(opts => EventStack.instance.push(opts))
        }
    }

    customElements.define('buffered-stage', Stage);

    const poster_null = "data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAJEAAAAABO0S+tAAAADUlEQVQY02NgGAVEAQABKQABQ8duRgAAAABJRU5ErkJggg==";
    const stage = document.getElementById(id);
    let director = null;
    let audioStack = null;
    let eventStack = null;
    const audio_path = `${scenario.sources}/${scenario.audio}/`;
    const image_path = `${scenario.sources}/${scenario.image}/`;
    let video_path = getVideoPath();
    const audio_hit = new Audio(audio_path + "click.mp3");
    const audio_error = new Audio(audio_path + "error.mp3");
    const audio_delay = new Audio(audio_path + "blank2.mp3");
    const audio_music = new Audio(audio_path + "blank2.mp3");
    let ignore_click = false;
    window.lastTapTime = (new Date).getTime();

    stage.addEventListener("touchend", function media_init() {
        audio_delay.play().then(() => {}).catch(() => {});
        audio_music.play().then(() => {}).catch(() => {});
        stage.init();
        stage.removeEventListener("touchend", media_init)
    });

    (function init() {
        scenario.thumb && stage.setStatic(image_path + scenario.thumb) || stage.showStatic();
        stage.addEventListener("click", function handle() {
            toggleFullScreen();
            stage.classList.add("playing");
            stage.addEventListener("click", (evt) => {
                evt.stopPropagation();
                if(evt.hit || ignore_click) {
                    return;
                }
                audio_error.play().then(() => {});
            });
            director = new Director();
            stage.removeEventListener("click", handle);
            window.addEventListener("dblclick",  toggleFullScreen);
            window.addEventListener("touchstart",  clickHandler);
        });
    })()

    function clickHandler(e) {
        const currentTapTime = (new Date).getTime();
        const delta = currentTapTime - window.lastTapTime;
        if(delta < 200 && delta > 100) {
            toggleFullScreen();
        }
        window.lastTapTime = currentTapTime;
    }

    function toggleFullScreen(e) {
        if (typeof screen.orientation !== undefined && (document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement || stage.classList.contains("foolscreen"))) {
            switch ("function") {
                case typeof (document.exitFullscreen) :
                    document.exitFullscreen();
                    return;
                case typeof (document.msExitFullscreen) :
                    document.msExitFullscreen();
                    return;
                case typeof (document.mozExitFullscreen) :
                    document.mozExitFullscreen();
                    return;
                case typeof (document.webkitExitFullscreen) :
                    document.webkitExitFullscreen();
                    return;
                default: stage.classList.remove("foolscreen");
            }
        } else {
            switch ("function") {
                case typeof stage.requestFullscreen :
                    stage.requestFullscreen();
                    break;
                case typeof stage.msRequestFullscreen :
                    stage.msRequestFullscreen();
                    break;
                case typeof stage.mozRequestFullscreen :
                    stage.mozRequestFullscreen();
                    break;
                case typeof stage.webkitRequestFullscreen :
                    stage.webkitRequestFullscreen();
                    break;
                default:
                    stage.classList.add("foolscreen");
            }
            if(typeof screen.orientation?.lock === "function") {
                screen.orientation.lock("landscape").catch((_) => {/* PASS */});
            }
        }
    }

    function getVideoPath() {
        const size = scenario.sizes.sort((a, b) => a - b).find((size, index, array) => {
            if (index === array.length - 1) {
                return size;
            }
            return size >= window.screen.height;
        });
        return `${scenario.sources}/${size}/`;
    }
}

// vim: expandtab:ts=4:sw=4
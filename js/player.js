function Filmteractive(id, scenario, options) {

    class Stage extends HTMLDivElement {

        static count = 2;

        constructor() {
            super();
            this.index = 0;

            this.next_scene = null;
            this.static = null;

            this.buffers = [];
            this.sources = [];

            this.frameGrabber = document.createElement("canvas");

            this.attachElements();
        }

        attachElements() {
            this.attachStatic();
            this.attachBuffers();
        }

        attachBuffers() {
            for (let i = 0; i < Stage.count; i++) {
                const video_buffer = document.createElement("video");
                const video_source = document.createElement("source");
                video_source.setAttribute("type", "video/mp4");

                video_buffer.id = `stage-buffer-${i}`;
                video_buffer.appendChild(video_source);
                video_buffer.removeAttribute("controls");
                video_buffer.addEventListener("ended", (evt) => {
                    const buffer = evt.target;
                    if (this.isCurrent(buffer)) {
                        this.showStatic();
                        const event = document.createEvent('Event');
                        event.initEvent("current-buffer-ended", true, true);
                        this.dispatchEvent(event);
                    }
                    buffer.classList.remove("current");
                });

                video_buffer.addEventListener("canplaythrough", (evt) => {
                    if (this.next_scene && this.isCurrent(evt.target)) {
                        this.preload();
                    }
                });

                video_buffer.addEventListener("timeupdate", (evt) => {
                    const buffer = evt.target;
                    if (this.isCurrent(buffer) && (buffer.currentTime >= buffer.duration)) {
                        this.frameGrabber.width = buffer.videoWidth;
                        this.frameGrabber.height = buffer.videoHeight;
                        this.frameGrabber.getContext("2d").drawImage(buffer, 0, 0);
                        this.setStatic(this.frameGrabber.toDataURL());
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
            this.appendChild(this.static);
            this.showStatic();
        }

        showStatic() {
            this.static.classList.add("current");
        }

        hideStatic() {
            this.static.classList.remove("current");
            this.static.setAttribute("src", "");
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

        play() {
            this.hideStatic();
            this.currentBuffer.classList.add("current");
            this.currentBuffer.play();
        }

        increment() {
            this.index = ++this.index % Stage.count;
        }

        swapBuffers() {
            this.increment();
            this.buffers.forEach((buffer) => {
                buffer.classList.remove("current")
            })
        }

        get currentBuffer() {
            return this.buffers[this.index];
        }

        get nextBuffer() {
            return this.buffers[(this.index + 1) % Stage.count];
        }

        get currentSource() {
            return this.sources[this.index];
        }

        get nextSource() {
            return this.sources[(this.index + 1) % Stage.count];
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

        setStatic(poster) {
            this.static.src = poster;
        }

        setScene(scene) {
            this.showStatic();
            const src = video_path + scene.vsrc;
            if (this.nextSource.getAttribute("src") !== src) {
                this.nextSource.setAttribute("src", src);
                this.nextBuffer.dataset.loading = "0";
            }

            if (this.nextBuffer.dataset.loading === "0") {
                this.nextBuffer.load();
                this.nextBuffer.dataset.loading = "1";
            }

            this.next_scene = scene.onend;

            this.swapBuffers();
        }

        preload() {
            const scene = scenario.scenes[this.next_scene?.scene || this.next_scene];
            if (scene) {
                this.nextSource.setAttribute("src", video_path + scene.vsrc);
                this.nextBuffer.load();
                this.nextBuffer.currentTime = this.next_scene?.time || 0;
                this.nextBuffer.dataset.loading = "1";
            }
        }
    }

    class SoundBite {
        secondary = false;

        constructor(opts) {
            this.evt = opts;
            this.opts = this.evt.sound;
            this.secondary = opts.secondary;
            this.audio = new Audio();
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
            this.audio.play();
        }

        kill() {
            this.audio.pause();
            this.audio = null;
        }

        onend() {
            const onend = this.opts.onend || false;
            if (!onend) {
                return;
            }
            if (onend?.type === "repeat") {
                const timeout = onend?.timeout || 0;
                Object.assign({}, this.evt, {span: timeout});
                EventStack.instance.push(Object.assign({}, this.evt, {span: timeout}));
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

        static self = false;

        static get instance() {
            if (!AudioStack.self) {
                AudioStack.self = new AudioStack();
            }
            return AudioStack.self;
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

    class Event {

        constructor(opts) {
            this.opts = opts;
            this.delete_me = false;
            this.timeout = false;
            this.audio_index = false;

            this.handler = this.activate.bind(this);

            if (this.opts.global) {
                this.emerge();
            } else {
                this.init();
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

        get single() {
            return this.opts.single || false;
        }
    }

    class EventStack {
        static self = false;

        static get instance() {
            if (!EventStack.self) {
                EventStack.self = new EventStack();
            }
            return EventStack.self;
        }

        constructor() {
            this.data = [];
        }

        push(opts) {
            const evt = new Event(opts);
            if (evt.single && this.has(evt)) {
                return;
            }
            this.data.push(new Event(opts));
        }

        update(scene_id) {
            this.data = this.data.filter(event => event && event.updateSceneId(scene_id));
        }

        has(event) {
            this.data.some((evt) => {
                return JSON.stringify(evt) === JSON.stringify(event)
            })
        }
    }

    class Director {

        constructor() {
            this.vsource = document.createElement("source");

            const bound_ended = this.ended.bind(this);
            stage.addEventListener("current-buffer-ended", bound_ended);
            this.addEvents(scenario.events.map(evt => ({...evt, global: true})));
            this.setScene(scenario.enter)
        }

        ended() {
            if (this.scene.onend) {
                this.setScene(this.scene.onend?.scene || this.scene.onend);
            }
        }

        setScene(scene_id) {
            EventStack.instance.update(scene_id);
            this.scene = scenario.scenes[scene_id];
            this.act();
        }

        act() {
            stage.setScene(this.scene);
            if (this.scene.poster) {
                const image = typeof (this.scene.poster) === "object" ? this.scene.poster.image : this.scene.poster;
                const sound = this.scene.poster.sound;

                stage.setStatic(image);
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
                    director.addEvents(director.scene.events);
                    stage.removeEventListener("click", handle)
                });
            } else {
                stage.play();
                this.addEvents(this.scene.events);
            }
        }

        addEvents(events = []) {
            events.forEach(opts => EventStack.instance.push(opts))
        }
    }


    customElements.define('buffered-stage', Stage, {extends: 'div'});

    const stage = document.getElementById(id);
    let director = null;
    let scene = null;
    const audio_path = `${scenario.sources}/${scenario.audio}/`;
    const image_path = `${scenario.sources}/${scenario.image}/`;
    let video_path = getVideoPath();

    (function init() {
        scenario.thumb && stage.setStatic(image_path + scenario.thumb, false);
        stage.addEventListener("click", function handle() {
            toggleFullScreen(this);
            director = new Director();
            stage.removeEventListener("click", handle);
        });
    })()

    function toggleFullScreen() {
        if (document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
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
            }
        } else {
            switch ("function") {
                case typeof stage.requestFullscreen :
                    stage.requestFullscreen();
                    return;
                case typeof stage.msRequestFullscreen :
                    stage.msRequestFullscreen();
                    return;
                case typeof stage.mozRequestFullscreen :
                    stage.mozRequestFullscreen();
                    return;
                case typeof stage.webkitRequestFullscreen :
                    stage.webkitRequestFullscreen();
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
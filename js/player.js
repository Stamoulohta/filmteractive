function Filmteractive(id, scenario, options) {

    const vplayer = document.getElementById(id);
    let director = null;
    let scene = null;
    const audio_path = `${scenario.sources}/${scenario.audio}/`;
    const image_path = `${scenario.sources}/${scenario.image}/`;

    const getVideoPath = function () {
        const size = scenario.sizes.sort((a, b) => a - b).find((size, index, array) => {
            if (index === array.length - 1) {
                return size;
            }
            size >= window.screen.height;
        });

        return `${scenario.sources}/${size}/`;
    }

    let video_path = getVideoPath();

    class SoundBite {
        secondary = false;

        constructor(opts) {
            this.opts = opts;
            this.secondary = opts.secondary;
            this.audio = new Audio();
            this.audio.src = this.src;
            this.audio.loop = this.opts.loop || false;
            this.audio.volume = this.opts.volume || 1;
            this.load();
        }

        load() {
            this.audio.load();
        }

        reload(random = true) {
            if (random && Array.isArray(this.opts.src)) {
                this.audio.src = this.src;
                this.load();
            }
            this.audio.currentTime = 0;
            if (this.audio.currentTime) {
                this.load();
            }
        }

        play() {
            this.audio.play();
        }

        kill() {
            this.audio.pause();
            this.audio = null;
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
                    vplayer.addEventListener(this.opts.type, this.handler);
                    break;
                case this.opts.type === "timeout" :
                    this.timeout = setTimeout(this.handler, this.opts.span);
                    break;
            }
        }

        insideHitbox(evt) {
            // TODO: there may be a difference with aspect ratio
            const vw = vplayer.clientWidth;
            const vh = vplayer.clientHeight;

            const ht = (vh / 100) * this.opts.constraints.hitbox[0];
            const hr = (vw / 100) * this.opts.constraints.hitbox[1];
            const hb = (vh / 100) * this.opts.constraints.hitbox[2];
            const hl = (vw / 100) * this.opts.constraints.hitbox[3];

            return evt.offsetY >= ht
                && evt.offsetX <= hr
                && evt.offsetY <= hb
                && evt.offsetX >= hl;
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
                run &= vplayer.currentTime >= this.opts.constraints.timespan[0];
                if (this.opts.constraints.timespan[1]) {
                    run &= vplayer.currentTime <= this.opts.constraints.timespan[1];
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
                this.audio_index = AudioStack.instance.push(this.opts.sound);
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
                    vplayer.removeEventListener(this.opts.type, this.handler)
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
            this.data.push(new Event(opts));
        }

        update(scene_id) {
            this.data = this.data.filter(event => event && event.updateSceneId(scene_id));
        }
    }

    const Director = function () {

        const vsource = document.createElement("source");

        const ended = function () {
            if (scene.onend) {
                setScene(scene.onend);
            }
        }

        const init = function () {
            vplayer.addEventListener("ended", ended);
            vsource.setAttribute("type", "video/mp4");
            vplayer.appendChild(vsource);
            addEvents(scenario.events.map(evt => ({...evt, global: true})));
            setScene(scenario.enter)
        }

        const setScene = function (scene_id) {
            EventStack.instance.update(scene_id);
            scene = scenario.scenes[scene_id];
            act();
        }

        const act = function () {
            vsource.setAttribute("src", video_path + scene.vsrc);
            vplayer.setAttribute("poster", null);
            vplayer.load();
            vplayer.removeAttribute("loop")
            // TODO: extend last frame
            // https://stackoverflow.com/questions/19175174/capture-frames-from-video-with-html5-and-javascript
            if (scene.poster) {
                const image = typeof(scene.poster) === "object" ? scene.poster.image : scene.poster;
                const sound = scene.poster.sound;

                vplayer.setAttribute("poster", image);
                if(sound) {
                    addEvents([{
                        "type" : "timeout",
                        "span": 1,
                        "sound": {
                            "src": sound
                        }
                    }]);
                }
                vplayer.addEventListener("click", function handle() {
                    vplayer.play();
                    addEvents(scene.events);
                    vplayer.removeEventListener("click", handle)
                });
            } else {
                vplayer.play();
                addEvents(scene.events);
            }
        }

        const addEvents = function (events = []) {
            events.forEach(opts => EventStack.instance.push(opts))
        }

        init();

        return {
            setScene: setScene
        }
    }

    const init = function () {
        scenario.thumb && vplayer.setAttribute("poster", image_path + scenario.thumb);
        vplayer.addEventListener("click", function handle() {
            //toggleFullScreen(this);
            director = new Director();
            vplayer.removeEventListener("click", handle);
        });
    }

    const toggleFullScreen = function (vplayer) {
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
                case typeof vplayer.requestFullscreen :
                    vplayer.requestFullscreen();
                    return;
                case typeof vplayer.msRequestFullscreen :
                    vplayer.msRequestFullscreen();
                    return;
                case typeof vplayer.mozRequestFullscreen :
                    vplayer.mozRequestFullscreen();
                    return;
                case typeof vplayer.webkitRequestFullscreen :
                    vplayer.webkitRequestFullscreen();
            }
        }
    }

    init();

    const reset = false; // TODO: implement
    const pause = false; // TODO: implement
    const play = false; // TODO: implement
    const event = false; // TODO: implement

    return {
        play: play,
        pause: pause,
        reset: reset,

        scene: scene,
        scenario: scenario,
    }
}

// vim: expandtab:ts=4:sw=4
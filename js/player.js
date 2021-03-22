function Filmteractive(id, scenario, options) {

    const vplayer = document.getElementById(id);
    let director = null;
    let scene = null;
    const audio_path = `${scenario.sources}/${scenario.audio}/`;
    const image_path = `${scenario.sources}/${scenario.image}/`;

    console.log(image_path);

    const getVideoPath = function() {
        const size = scenario.sizes.sort((a, b) => a - b).find((size, index, array) => {
            if (index === array.length - 1) {
                return size;
            }
            size >= window.screen.height;
        });

        return `${scenario.sources}/${size}/`;
    }

    let video_path = getVideoPath();

    const Event = function(evt_opts) {

        let delete_me = false;
        
        let timeout = false;
        let audio = false;
        
        const insideHitbox = function(evt, hitbox) {
            // TODO: there may be a difference with aspect ratio
            const vw = vplayer.clientWidth;
            const vh = vplayer.clientHeight;

            const ht = (vh / 100) * hitbox[0];
            const hr = (vw / 100) * hitbox[1];
            const hb = (vh / 100) * hitbox[2];
            const hl = (vw / 100) * hitbox[3];

            return evt.offsetY >= ht
                && evt.offsetX <= hr
                && evt.offsetY <= hb
                && evt.offsetX >= hl;
        }

        const shouldRun = function(constraints, evt) {
            console.log("constraints", constraints);
            if(constraints === undefined) {
                return true
            }
            let run = true;
            if(constraints.hitbox !== undefined) {
                run &= insideHitbox(evt, constraints.hitbox)
                console.log("inside " , run);
            }
            if(constraints.timespan !== undefined) {
                console.log("timespan", constraints.timespan[0]);
                console.log("current", vplayer.currentTime);
                run &= vplayer.currentTime >= constraints.timespan[0];
                if(constraints.timespan[1]) {
                    run &= vplayer.currentTime <= constraints.timespan[1];
                }
            }
            return run;
        }

        const activate = function(evt = false) {
            if(! shouldRun(evt_opts.constraints, evt)) {
                return;
            }
            if(evt && evt.type === "click" && evt_opts.hitbox && ! insideHitbox(evt, evt_opts.hitbox)) {
                return;
            }
            if(evt_opts.sound) {
                audio = new Audio(audio_path + evt_opts.sound.src);
                audio.loop = evt_opts.sound.loop;
                audio.play();
            }
            if(evt_opts.scene) {
                director.setScene(evt_opts.scene);
            }
        }

        const killAudio = function() {
            if (audio) {
                audio.stop();
                audio = null;
            }
        }

        const abort = function() {
            console.log("abort")
            killAudio();
            switch(true) {
                case evt_opts.type === "click" :
                    vplayer.removeEventListener(evt_opts.type, activate)
                    break;
                case evt_opts.type === "timeout" :
                    clearTimeout(timeout);
            }
        }

        const isDone = function(scene_id) {
            if(! evt_opts.scene_span) {
                return true;
            } else if( Array.isArray(evt_opts.scene_span)) {
                return !evt_opts.includes(scene_id);
            } else if(evt_opts.scene_span.startsWith) {
                return !scene_id.startsWith(evt_opts.scene_span.startsWith);
            }
        }

        const updateSceneId = function(scene_id) {
            delete_me = isDone(scene_id);
            if(delete_me) {
                abort();
            }
            console.log("delete event", delete_me);
            return !delete_me;
        }

        const init = function() {
            switch(true) {
                case evt_opts.type === "click" :
                    vplayer.addEventListener(evt_opts.type, activate)
                    break;
                case evt_opts.type === "timeout" :
                    timeout = setTimeout(activate, evt_opts.span);
                    break;
                default :
                    return;
            }
        }

        init();

        return {
            updateSceneId : updateSceneId
        }
    }

    const EventQueue = function() {

        let queue = [];

        const push = function(evt_opts) {
            console.log('push')
            queue.push(new Event(evt_opts));
            console.log('after push', queue.length);
        }

        const update = function(scene_id) {
            console.log("update", queue.length);
            queue = queue.filter(event => event.updateSceneId(scene_id));
        }

        return {
            push : push,
            update : update,
        }
    }

    const Director = function() {

        const vsource = document.createElement("source");
        const queue = new EventQueue();

        const ended = function() {
            console.log("scene ended");
            if(scene.onend) {
                setScene(scene.onend);
            }
        }

        const init = function() {
            vplayer.addEventListener("ended", ended);
            vsource.setAttribute("type", "video/mp4");
            vplayer.appendChild(vsource);
            addEvents(scenario.events)
            setScene(scenario.enter)
        }

        const setScene = function(scene_id) {
            queue.update(scene_id);
            scene = scenario.scenes[scene_id];
            act();
        }

        const act = function() {
            console.log("act");
            vsource.setAttribute("src", video_path + scene.vsrc);
            vplayer.setAttribute("poster", null);
            vplayer.load();
            vplayer.removeAttribute("loop")
            if(scene.poster) {
                vplayer.setAttribute("poster", scene.poster);
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

        const addEvents = function(evt_arr = []) {
            evt_arr.forEach(evt_opts => queue.push(evt_opts))
        }

        init();

        return {
            setScene : setScene
        }
    }

    const init = function () {
        console.log('filmteractive init');
        scenario.thumb && vplayer.setAttribute("poster", image_path + scenario.thumb);
        vplayer.addEventListener("click", function handle() {
            console.log('first click');
            //toggleFullScreen(this);
            director = new Director();
            vplayer.removeEventListener("click", handle);
            console.log(vplayer.offsetTop, vplayer.offsetLeft)
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
    const play  = false; // TODO: implement
    const event = false; // TODO: implement

    return {
        play  : play,
        pause : pause,
        reset : reset,

        scene : scene,
        scenario : scenario,
    }
}
// vim: expandtab:ts=4:sw=4
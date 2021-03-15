function Filmteractive(id, scenario) {

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

    Event = function(evt_opts) {

        let repeats = false;
        let ignores = false;


        const activate = function(evt) {
            if(evt_opts.sound) {
                (new Audio(audio_path + evt_opts.sound)).play();
            }
            if(evt_opts.scene) {

                director.setScene(evt_opts.scene);
            }
        }

        const abord = function() {
            vplayer.removeEventListener("click", activate)
        }

        switch(true) {
            case evt_opts.type === "click" :
            case evt_opts.type === "ended" :
                vplayer.addEventListener(evt_opts.type, activate)
                break;
            case evt_opts.type === "timeout" :
                setTimeout(activate, evt_opts.span);
                break;
            default :
                return;
        }
    }

    const Director = function() {

        const vsource = document.createElement("source");

        const init = function() {
            vsource.setAttribute("type", "video/mp4");
            vplayer.appendChild(vsource);
            addEvents(scenario.events)
            setScene(scenario.enter)
        }

        const setScene = function(scene_id) {
            scene = scenario.scenes[scene_id];
            act();
        }

        const act = function() {
            set();
        }

        const set = function() {
            vsource.setAttribute("src", video_path + scene.vsrc);
            vplayer.load();
            vplayer.play();
            addEvents(scene.events);
        }

        const addEvents = function(evt_arr) {
            evt_arr.forEach(options => new Event(options))
        }

        init();

        return {
            setScene : setScene
        }
    }

    const init = function () {
        scenario.thumb && vplayer.setAttribute("poster", image_path + scenario.thumb);
        vplayer.addEventListener("click", function handle() {
            this.removeEventListener("click", handle);
            toggleFullScreen(this);
            director = Director();
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
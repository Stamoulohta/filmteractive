function Filmteractive(id, scenario) {
    const vplayer = document.getElementById(id);
    let scene = null;
    let unbound_events = null;
    let bound_events = null;

    const director = function() {

        const vsource = document.createElement("source");
        let vpath = '/';

        const init = function() {
            document.createElement("source");
            vsource.setAttribute("type", "video/mp4");
            vplayer.appendChild(vsource);

            scene = scenario.scenes[scenario.enter]

            vpath = (() => {
                const size = scenario.sizes.sort((a, b) => a - b).find((size, index, array) => {
                    if (index === array.length - 1) {
                        return size;
                    }
                    size >= window.screen.height;
                });

                return `${scenario.vsources}/${size}/`;
            })();
            act();
        }

        const act = function() {
            set();
        }

        const set = function() {
            vsource.setAttribute("src", vpath + scene.vsrc);
            vplayer.load();
            vplayer.play();
            evts();
        }

        const evts = function() {
            bound_events = null;
            //scene.events.forEach(evt => evt.type(evt));
        }

        init();
    }

    const init = function () {
        scenario.poster && vplayer.setAttribute("poster", scenario.poster);
        vplayer.addEventListener("click", function handle() {
            this.removeEventListener("click", handle);
            toggleFullScreen(this);
            director();
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
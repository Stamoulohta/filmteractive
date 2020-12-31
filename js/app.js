"use strict";

document.addEventListener("DOMContentLoaded", () => {
    console.log('hello');
    Filmteractive("stage", JSON.parse(document.getElementById("scenario").text))
});

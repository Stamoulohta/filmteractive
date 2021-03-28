"use strict";

document.addEventListener("DOMContentLoaded", () => {
    new Filmteractive("stage", JSON.parse(document.getElementById("scenario").text))
});

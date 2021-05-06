"use strict";

function malert(str) {
    document.getElementById("malert").textContent += str;
}

document.addEventListener("DOMContentLoaded", () => {
    new Filmteractive("stage", JSON.parse(document.getElementById("scenario").text))
});

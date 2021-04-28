<?php

function bust($filename)
{
    return sprintf('%s?v=%d', $filename, filemtime($filename));
}

$app = 'js/app.js';
$player = 'js/player.js';
$scenario = 'scenario.json';
$manifest = 'manifest.json';
$style = 'css/style.css';

include('view/main.php');
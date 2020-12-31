<?php

function bust($filename)
{
    return sprintf('%s?v=%d', $filename, filemtime($filename));
}

$app = 'js/app.js';
$player = 'js/player.js';
$json = 'scenario.json';
$style = 'css/style.css';

include('view/main.php');
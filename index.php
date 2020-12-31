<?php

function bust($name)
{
    sprintf('%s?v=%d', $name, filemtime($name));
}

$js = 'js/app.js';
$json = 'scenario.json';
$style = 'css/style.css';

include('view.php');

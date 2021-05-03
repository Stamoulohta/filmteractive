<!doctype html>

<html lang="el">
<head>
  <meta charset="utf-8">

  <title>AψURDISM</title>
  <meta name="description" content="An interactive web performance">
  <meta name="author" content="Stamoulohta">

  <meta name="description" content="AψURDISM is an interactive web performance by opero(o)" />
  <meta name="keywords" content="stamoulohta, apsurdism, aψourdism, interactive, performance, filmteractive, opero, oper(o), αψούρντισμ" />

  <meta property="fb:app_id" content="908041063322452" />
  <meta property="og:type" content="video.other" />
  <meta property="og:title" content="AψURDISM" />
  <meta property="og:description" content="An interactive web performance by opero(o)" />
  <meta property="og:url" content="https://opero.gr/apsurdism/" />
  <meta property="og:image" content="https://opero.gr/apsurdism/assets/facebook.jpg" />

  <link rel="apple-touch-icon" sizes="57x57" href="assets/apple-icon-57x57.png">
  <link rel="apple-touch-icon" sizes="60x60" href="assets/apple-icon-60x60.png">
  <link rel="apple-touch-icon" sizes="72x72" href="assets/apple-icon-72x72.png">
  <link rel="apple-touch-icon" sizes="76x76" href="assets/apple-icon-76x76.png">
  <link rel="apple-touch-icon" sizes="114x114" href="assets/apple-icon-114x114.png">
  <link rel="apple-touch-icon" sizes="120x120" href="assets/apple-icon-120x120.png">
  <link rel="apple-touch-icon" sizes="144x144" href="assets/apple-icon-144x144.png">
  <link rel="apple-touch-icon" sizes="152x152" href="assets/apple-icon-152x152.png">
  <link rel="apple-touch-icon" sizes="180x180" href="assets/apple-icon-180x180.png">
  <link rel="icon" type="image/png" sizes="192x192"  href="assets/android-icon-192x192.png">
  <link rel="icon" type="image/png" sizes="32x32" href="assets/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="96x96" href="assets/favicon-96x96.png">
  <link rel="icon" type="image/png" sizes="16x16" href="assets/favicon-16x16.png">

  <meta name="msapplication-TileColor" content="#ffffff">
  <meta name="msapplication-TileImage" content="assets/ms-icon-144x144.png">
  <meta name="theme-color" content="#ffffff">

  <link rel="manifest" href="<?= bust($manifest) ?>">
  <link rel="stylesheet" href="<?= bust($style) ?>">

  <script id="scenario" type="application/json">
    <?php include($scenario) ?>
  </script>

</head>

<body>
  <div class="main">
       <buffered-stage id="stage"></buffered-stage>
  </div><!-- .main -->

  <footer>
    <a id="back" href="https://opero.gr/productions.php">oper(o)</a>
    <script src="<?= bust($player) ?>"></script>
    <script src="<?= bust($app) ?>"></script>
  </footer>
</body>
</html>
<!-- vim: set expandtab ts=2 sw=2: -->

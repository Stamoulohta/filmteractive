<!doctype html>

<html lang="el">
<head>
  <meta charset="utf-8">

  <title>AψURDISM</title>
  <meta name="description" content="An interactive web performance">
  <meta name="author" content="Stamoulohta">

  <meta name="description" content="AψURDISM is an interactive web performance" />
  <meta name="keywords" content="stamoulohta, apsurdism, aψourdism, interactive, performance, filmteractive, opero" />

  <meta property="fb:app_id" content="908041063322452" />
  <meta property="og:type" content="video.other" />
  <meta property="og:title" content="AψURDISM" />
  <meta property="og:description" content="An interactive web performance" />
  <meta property="og:url" content="https://opero.gr/apsurdism" />
  <meta property="og:image" content="https://opero.gr/apsurdism/assets/facebook.jpg" />

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
    <script src="<?= bust($player) ?>"></script>
    <script src="<?= bust($app) ?>"></script>
  </footer>
</body>
</html>
<!-- vim: set expandtab ts=2 sw=2: -->

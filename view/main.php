<!doctype html>

<html lang="el">
<head>
  <meta charset="utf-8">

  <title>AψURDISM</title>
  <meta name="description" content="Filmteractive">
  <meta name="author" content="Stamoulohta">

  <!-- TODO: Open Graph -->

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

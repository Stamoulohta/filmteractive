<!doctype html>

<html lang="el">
<head>
  <meta charset="utf-8">

  <title>AψURDISM</title>
  <meta name="description" content="Filmteractive">
  <meta name="author" content="Stamoulohta">

  <!-- TODO: Open Graph -->

  <link rel="stylesheet" href="<?= bust($style) ?>">

  <script id="scenario" type="application/json">
    <?php include($json) ?>
  </script>

</head>

<body>
  <div class="main">
    <article>
      <header></header>
       <buffered-stage id="stage" height="50%"></buffered-stage>
    </article>
  </div><!-- .main -->

  <footer>
    <script src="<?= bust($player) ?>"></script>
    <script src="<?= bust($app) ?>"></script>
  </footer>
</body>
</html>
<!-- vim: set expandtab ts=2 sw=2: -->

<!doctype html>

<html lang="el">
<head>
  <meta charset="utf-8">

  <title>AψURDISM</title>
  <meta name="description" content="WebFormance Show">
  <meta name="author" content="Stamoulohta">

  <!-- TODO: Open Graph -->

  <link rel="stylesheet" href="<?= bust('style') ?>">

  <script id="scenario" type="application/json">
    <?php include($json) ?>
  </script>

</head>

<body>
  <div class="main">
    <article>
      <header></header>
      <video id="stage" height="50%"><video>
    </article>
  </div><!-- .main -->

  <footer>
    <script src="<?= bust($js) ?>"></script>
  </footer>
</body>
</html>
<!-- vim: set expandtab ts=2 sw=2: -->

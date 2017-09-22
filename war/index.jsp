<!DOCTYPE html>
<html lang="en">

<head>
	    <meta charset="utf-8">
	    <meta http-equiv="X-UA-Compatible" content="IE=edge">
	    <meta name="viewport" content="width=device-width, initial-scale=1">
	    <meta name="description" content="">
	    <meta name="author" content="">

	    <title>QDAcity</title>
		<script type="text/javascript">
			var googleClientPromise = new Promise(function (resolve, reject) {
					window.resolveClient = resolve;
				}
			);
			var googlePlatformPromise = new Promise(
				function (resolve, reject) {
					window.resolvePlatform = resolve;
				}
			);
		</script>
		<script src="https://apis.google.com/js/client.js?onload=resolveClient" async></script>
		<script src="https://apis.google.com/js/platform.js?onload=resolvePlatform" async></script>

		<!-- Themes -->
		<link rel="preload" href="components/font-awesome/css/font-awesome.min.css" as="style">
		<link rel="preload" type="text/css" charset="utf-8" href="//cdn.jsdelivr.net/jquery.slick/1.6.0/slick-theme.css" as="style"/>
		<link rel="preload" type="text/css" href="//code.jquery.com/ui/1.11.4/themes/smoothness/jquery-ui.min.css"  as="style">
		<link rel="stylesheet" type="text/css" href="dist/js/styles.css">

		<script type="text/javascript">
			mxBasePath = 'components/mxGraph/javascript/src';
			
			var mxLoadResources = false;
			var mxLoadStylesheets = false;
		</script>
</head>

<body>
	<div id="navBar"></div>
	<div id=indexContent></div>

    <script src="dist/js/index.dist.js"></script>
	<link href="components/font-awesome/css/font-awesome.min.css" rel="stylesheet" type="text/css">
	<link rel="stylesheet" type="text/css" charset="utf-8" href="//cdn.jsdelivr.net/jquery.slick/1.6.0/slick-theme.css" as="style"/>
	<link rel="stylesheet" type="text/css" href="//code.jquery.com/ui/1.11.4/themes/smoothness/jquery-ui.min.css" as="style"/>
</body>

</html>

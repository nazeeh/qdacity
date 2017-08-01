<!DOCTYPE html>
<html lang="en">

<head>

	    <meta charset="utf-8">
	    <meta http-equiv="X-UA-Compatible" content="IE=edge">
	    <meta name="viewport" content="width=device-width, initial-scale=1">
	    <meta name="description" content="">
	    <meta name="author" content="">

	    <title>QDAcity</title>

	    <!-- Bootstrap Core CSS -->
	    <link href="components/bootstrap/bootstrap.min.css" rel="stylesheet">

	    <!-- Custom CSS -->
	    <link href="assets/css/landing-page.css" rel="stylesheet">
	    <link href="assets/css/navbar-account.css" rel="stylesheet">
	    <link rel="stylesheet" href="components/Vex/css/vex.css" />
		<link rel="stylesheet" href="components/Vex/css/vex-theme-os.css" />

		<!-- ProjectDashboard CSS -->
		<link href="assets/css/project-list.css" rel="stylesheet">
		<link href="assets/css/notificationList.css" rel="stylesheet">
		<link href="assets/css/search-box.css" rel="stylesheet">
		<link href="components/AdminLTE/css/AdminLTE.css" rel="stylesheet">
		<link href="assets/css/dashboard.css" rel="stylesheet">
		<link href="assets/css/common.css" rel="stylesheet">
		<link href="assets/css/IntercoderAgreement.css" rel="stylesheet">

		<link rel="stylesheet" type="text/css" href="//cdn.jsdelivr.net/jquery.slick/1.6.0/slick.css"/>
		<link rel="stylesheet" type="text/css" href="//cdn.jsdelivr.net/jquery.slick/1.6.0/slick-theme.css"/>
		<link href="components/DataTables-1.10.7/media/css/jquery.dataTables.css" rel="stylesheet">
		<!-- ProjectDashboard -->
		<link href="assets/css/customTimeline.css" rel="stylesheet">
		<link href="assets/css/agreementStats.css" rel="stylesheet">
		<link href="components/Alertify/css/alertify.core.css" rel="stylesheet">
		<link href="components/Alertify/css/alertify.default.css" rel="stylesheet">

		<!-- CodingEditor -->
		<link href="assets/css/coding-editor.css" rel="stylesheet">
		<link href="assets/css/documentView.css" rel="stylesheet">
		<link href="assets/css/footer.css" rel="stylesheet">
		<link href="assets/css/CodesystemView.css" rel="stylesheet">
		<link href="components/tooltipster/css/tooltipster.css" rel="stylesheet">
		<link href="assets/css/agreementMap.css" rel="stylesheet">
		<link href="components/filer/css/jquery.filer.css" type="text/css" rel="stylesheet" />
		<link href="components/filer/css/themes/jquery.filer-dragdropbox-theme.css" type="text/css" rel="stylesheet" />
		<link href="components/colorpicker/evol.colorpicker.css" rel="stylesheet" type="text/css">
		<link rel="stylesheet" href="//code.jquery.com/ui/1.11.4/themes/smoothness/jquery-ui.css">
		<script type="text/javascript">mxBasePath = 'components/mxGraph/javascript/src';</script>
		<script type="text/javascript" src="components/mxGraph/javascript/mxClient.min.js"></script>


	    <!-- Custom Fonts -->
	    <link href="components/font-awesome/css/font-awesome.min.css" rel="stylesheet" type="text/css">
	    <link href="https://fonts.googleapis.com/css?family=Lato:300,400,700,300italic,400italic,700italic" rel="stylesheet" type="text/css">

		<script src="//code.jquery.com/jquery-1.10.2.js"></script>

		<!-- CodingEditor -->
		<script src="//code.jquery.com/ui/1.11.4/jquery-ui.js"></script>
		<script src="https://d3js.org/d3.v3.min.js" charset="utf-8"></script>

		<script src="https://unpkg.com/react@15/dist/react.js"></script>
		<script src="https://unpkg.com/react-dom@15/dist/react-dom.js"></script>
</head>

<body>

    <!-- Navigation -->
	<nav class="navbar navbar-default navbar-fixed-top topnav" role="navigation">
		<div class="container topnav">
			<!-- Brand and toggle get grouped for better mobile display -->
			<div class="navbar-header">
				<button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
					<span class="sr-only">Toggle navigation</span> <span class="icon-bar"></span> <span class="icon-bar"></span> <span class="icon-bar"></span>
				</button>
				<a id="qdactiy-logo" class="navbar-brand topnav" >QDAcity</a>
			</div>
			<!-- Collect the nav links, forms, and other content for toggling -->
			<div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
				<ul class="nav navbar-nav navbar-right">
					<li><a href="index.html#about">About</a></li>
					<li><a href="index.html#contact">Contact</a></li>

					<li id="navAccount" class="dropdown">
						<a href="#" class="dropdown-toggle" data-toggle="dropdown">
							Account <b class="caret"></b>
						</a>
 						<div id="accountView" class="dropdown-menu"></div>
					</li>
					<li id="navSignin" class="dropdown"><a href="#" class="dropdown-toggle" data-toggle="dropdown">
							Sign In <b class="caret"></b>
						</a>
						<ul class="dropdown-menu">
							<li>
								<div class="navbar-content">
									<div class="row">
										<div class="col-md-12" style="text-align: center; padding-bottom: 15px;">
											<a id="navBtnSigninGoogle" class="btn  btn-primary" href="#">
												<i class="fa fa-google fa-2x pull-left"></i>
												<span style="font-size: 18px;">Sign in with Google</span>
											</a>
										</div>
									</div>
								</div>
								<div class="navbar-footer">
									<div class="navbar-footer-content">
										<div class="row">
											<div class="col-md-12"></div>
										</div>
									</div>
								</div>
							</li>
						</ul></li>
				</ul>
			</div>
			<!-- /.navbar-collapse -->
		</div>

		<!-- /.container -->
	</nav>
	<div id=indexContent></div>

    <script src="dist/js/index.dist.js"></script>
</body>

</html>

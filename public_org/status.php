<?php
require('lib.php');
require('tweet.php');

$id = $_GET["id"];








$TweetData = get("/api/v1/statuses/".$id);
$TweetData->account->username;
$context = $TweetData->context;

echo <<<EOM
<html>
	<body>
		<head>
			<meta charset="utf-8">

			<title>GC2 - 言論の自由を尊重したSNS</title>
			<meta name="description" content="GC2はYouTubeやTwitterといった既存のSNSより言論の自由を尊重したSNSです。" />
			<meta name="og:title" content="GC2 - @{$username}">
			<meta name="og:description" content="{$context}">

			<link href="/favicon.ico" rel="icon" type="image/x-icon">
			<style>
				body {
					margin: 0px;
				}

				header {
					background: #ffffff;
					overflow: hidden;
					width: 100%;
					font-size: 100%;
					font: inherit;
					border: solid 1px #eeeeee;
					box-sizing: border-box;
				}
				header img {
					height: 50px;
					margin: 10px;
				}
			</style>
EOM;
PrintTweetStyle();
echo <<<EOM
		</head>
		<header>
			<img src="/logo/gc2_logo.png">
		</header>
		<div class="tweetlist">
EOM;


PrintTweet($TweetData);


echo <<<EOM
		</div>
	</body>
</html>
EOM;
?>
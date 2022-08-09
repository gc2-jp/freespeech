<?php
function PrintTweetStyle(){
	echo <<<EOM
		<style>
			.tweetlist {
				margin: 20px auto;
				max-width: 578px;
			}

			.tweet {
				background: #ffffff;
				overflow: hidden;
				max-width: 578px;
				margin: 0px auto;
				font-size: 100%;
				font: inherit;
				border: solid 1px #eeeeee;
			}
			.tweet a {
				color: black;
				text-decoration: none;
			}

			.account {
				position: relative;
				margin: 10px auto;
				padding: 0px 10px;
				color: black;
			}
			.account img {
				display: inline-block;
				width:48px;
				border-radius: 5px;
			}
			.account .username {
				display: inline-block;
				position: absolute;
				margin: 0px 10px;
				font-size: 16px;
				font: inherit;
				font-weight: 500;
			}

			.container {
				padding: 0px 0px 0px 68px;
				margin:10px 0px;
				max-width: 442px;
			}
			.container img {
				width:100%;
			}

			.count {
				width:100%;
				border: solid 1px #eeeeee;
				padding: 0px 0px 0px 68px;
				display: block;
				color: black;
			}
			.count i {
				display: inline-block;
				margin: 0px 14px 0px 0px;
				color: #606984;
			}
			.reply {
				width:100%;
				border: solid 1px #eeeeee;
				padding: 0px 10px;
				display: block;
				color: black;
				text-align: center;
			}
		</style>
	EOM;
}


function PrintTweet($TweetData){
	$context = nl2br($TweetData->content);
	$url = $TweetData->url;
	$userurl = $TweetData->account->url;
	$username = $TweetData->account->username;
	$replies_count = $TweetData->replies_count;
	$reblogs_count = $TweetData->reblogs_count;
	$favourites_count = $TweetData->favourites_count;
	$avatar = $TweetData->account->avatar;
	$media_attachments = $TweetData->media_attachments;
	$media_html = "";
	for ($i=0;$i<count($media_attachments);$i++){
		$media = $media_attachments[$i];
		if ($media->type == "image"){
			$media_html .= <<<EOM
				<a href="{$media->url}" target="_blank"><img src="{$media->url}"></a>
			EOM;
		}
	}

	echo <<<EOM
				<div class="tweet">
					<a href="{$userurl}">
						<div class="account">
							<img src="{$avatar}">
							<strong class="username">{$username}</strong>
						</div>
					</a>
					<a href="{$config["api_url"]}/web/@{$username}/{$TweetData->id}">
						<div class="container">
							{$context}
							{$media_html}
						</div>
					</a>
					<a class="count" href="{$config["api_url"]}/web/@{$username}/{$TweetData->id}">
						<i>⮪ {$replies_count}</i><i>⭮ {$reblogs_count}</i><i>★ {$favourites_count}</i>
					</a>
				</div>
	EOM;
}
?>
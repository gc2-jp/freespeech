<?php
$config = json_decode(mb_convert_encoding(file_get_contents(".config.json"), 'UTF8', 'ASCII,JIS,UTF-8,EUC-JP,SJIS-WIN'),true);

function get($url){
	global $config;

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $config["api_url"].$url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_HTTPHEADER, array("Authorization: Bearer ".$config["access_token"]));
	$res = json_decode(curl_exec($ch));
	curl_close($ch);

	return $res;
}

function post($url,$data){
	global $config;

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
	curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($POST_DATA));
	curl_setopt($ch, CURLOPT_URL, $config["api_url"].$url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_HTTPHEADER, array("Authorization: Bearer ".$config["access_token"]));
	$res = json_decode(curl_exec($ch));
	curl_close($ch);

	return $res;
}
?>
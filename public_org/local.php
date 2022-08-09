<?php
require('lib.php');
require('tweet.php');




echo <<<EOM
<html>
	<body>
		<head>
			<meta charset="utf-8">

			<title>GC2 - 言論の自由を尊重したSNS</title>
			<meta name="description" content="GC2はYouTubeやTwitterといった既存のSNSより言論の自由を尊重したSNSです。" />

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
			<style>
				.EleAd1 {
				  display:flex;
				  align-items:center;
				  justify-content:center;
				}
				.EleAd1_inner {
				  width: 300px;
				}
			</style>

			<script>
				const sleep = function(msec){
				  return new Promise(function(resolve) {
				    setTimeout(function() {resolve()}, 1000*msec);
				  })
				};



				const AdList = {
				  "ad_1":[
				    {
				      "pctag":`
				        <div class='EleAd1_inner'>
				         <iframe id='a2e8f4e0' name='a2e8f4e0' src='https://ad.gc2.jp/www/delivery/afr.php?zoneid=2&amp;cb=INSERT_RANDOM_NUMBER_HERE' frameborder='0' scrolling='no' width='300' height='250' allow='autoplay'><a href='https://ad.gc2.jp/www/delivery/ck.php?n=aa328861&amp;cb=INSERT_RANDOM_NUMBER_HERE' target='_blank'><img src='https://ad.gc2.jp/www/delivery/avw.php?zoneid=2&amp;cb=INSERT_RANDOM_NUMBER_HERE&amp;n=aa328861' border='0' alt='' /></a></iframe>
				         @Ad
				        </div>
				      `,
				      "sptag":`
				        <div class='EleAd1_inner'>
				          <iframe id='afe1024c' name='afe1024c' src='https://ad.gc2.jp/www/delivery/afr.php?zoneid=5&amp;cb=INSERT_RANDOM_NUMBER_HERE' frameborder='0' scrolling='no' width='300' height='250' allow='autoplay'><a href='https://ad.gc2.jp/www/delivery/ck.php?n=a0067565&amp;cb=INSERT_RANDOM_NUMBER_HERE' target='_blank'><img src='https://ad.gc2.jp/www/delivery/avw.php?zoneid=5&amp;cb=INSERT_RANDOM_NUMBER_HERE&amp;n=a0067565' border='0' alt='' /></a></iframe>
				          @Ad
				        </div>
				      `,
				      "EleAd":null,
				    },
				    {
				      "pctag":`
				        <div class='EleAd1_inner'>
				          <iframe id='aab6f898' name='aab6f898' src='https://ad.gc2.jp/www/delivery/afr.php?zoneid=3&amp;cb=INSERT_RANDOM_NUMBER_HERE' frameborder='0' scrolling='no' width='300' height='250' allow='autoplay'><a href='https://ad.gc2.jp/www/delivery/ck.php?n=aeca92ee&amp;cb=INSERT_RANDOM_NUMBER_HERE' target='_blank'><img src='https://ad.gc2.jp/www/delivery/avw.php?zoneid=3&amp;cb=INSERT_RANDOM_NUMBER_HERE&amp;n=aeca92ee' border='0' alt='' /></a></iframe>
				          @Ad
				        </div>
				      `,
				      "sptag":`
				        <div class='EleAd1_inner'>
				          <iframe id='a3f1fdab' name='a3f1fdab' src='https://ad.gc2.jp/www/delivery/afr.php?zoneid=6&amp;cb=INSERT_RANDOM_NUMBER_HERE' frameborder='0' scrolling='no' width='300' height='250' allow='autoplay'><a href='https://ad.gc2.jp/www/delivery/ck.php?n=a9bb456a&amp;cb=INSERT_RANDOM_NUMBER_HERE' target='_blank'><img src='https://ad.gc2.jp/www/delivery/avw.php?zoneid=6&amp;cb=INSERT_RANDOM_NUMBER_HERE&amp;n=a9bb456a' border='0' alt='' /></a></iframe>
				          @Ad
				        </div>
				      `,
				       "EleAd":null,
				    },
				    {
				      "pctag":`
				        <div class='EleAd1_inner'>
				          <iframe id='ad05adf8' name='ad05adf8' src='https://ad.gc2.jp/www/delivery/afr.php?zoneid=4&amp;cb=INSERT_RANDOM_NUMBER_HERE' frameborder='0' scrolling='no' width='300' height='250' allow='autoplay'><a href='https://ad.gc2.jp/www/delivery/ck.php?n=af9f3ae1&amp;cb=INSERT_RANDOM_NUMBER_HERE' target='_blank'><img src='https://ad.gc2.jp/www/delivery/avw.php?zoneid=4&amp;cb=INSERT_RANDOM_NUMBER_HERE&amp;n=af9f3ae1' border='0' alt='' /></a></iframe>
				          @Ad
				        </div>
				      `,
				      "sptag":`
				        <div class='EleAd1_inner'>
				          <iframe id='a30fc57a' name='a30fc57a' src='https://ad.gc2.jp/www/delivery/afr.php?zoneid=7&amp;cb=INSERT_RANDOM_NUMBER_HERE' frameborder='0' scrolling='no' width='300' height='250' allow='autoplay'><a href='https://ad.gc2.jp/www/delivery/ck.php?n=a179b21b&amp;cb=INSERT_RANDOM_NUMBER_HERE' target='_blank'><img src='https://ad.gc2.jp/www/delivery/avw.php?zoneid=7&amp;cb=INSERT_RANDOM_NUMBER_HERE&amp;n=a179b21b' border='0' alt='' /></a></iframe>
				          @Ad
				        </div>
				      `,
				       "EleAd":null,
				    },
				  ],
				};
				(async () => {
				  let TweetListEleList = document.getElementsByClassName("tweetlist");
				  while (TweetListEleList.length == 0){
				    await sleep(0.1);
				  }
				  let TweetList = (TweetListEleList[0]).children;
				  while (TweetList.length == 0){
				    await sleep(0.1);
				  }



				  //初期生成
				  for (let index in AdList["ad_1"]){
				    let AdData = AdList["ad_1"][index];

				    let EleAd = document.createElement("div");
				    EleAd.id = `ad_1_${index}`;
				    EleAd.classList.add(`EleAd1`);
				    if (window.innerWidth > 895){
				     EleAd.innerHTML = AdData["pctag"];
				    }else{
				      EleAd.innerHTML = AdData["sptag"];
				    }
				    AdData["EleAd"] = EleAd;
				  }

				  while (true){
				    try{
				      let AdIndex = 0;
				      let TweetListEleList = document.getElementsByClassName("tweetlist");
				      if (TweetListEleList.length == 0){
				        continue;
				      }
				      let TweetList = Array.from((TweetListEleList[0]).children);
				      let count = 0;
				      for (let index in TweetList){
				        let EleTweet = TweetList[index];

				        if (count%10 == 0){
				          EleTweet.before(AdList["ad_1"][AdIndex]["EleAd"]);
				          AdIndex = AdIndex + 1;
				          if (AdList["ad_1"].length <= AdIndex){
				            break;
				          }
				        }
				        count = count + 1;
				      }

				      count = 0;
				      while (count < 60){
				        await sleep(1);
				        let AdEleList = document.getElementsByClassName("EleAd1");
				        if (AdEleList.length == 0 && count >= 1){
				          break;
				        }
				        count = count + 1;
				      }
				    }catch(e){
				      console.log(e);
				    }finally{
				      await sleep(0.1);
				    };
				  };
				})();
			</script>

		</head>
		<header>
			<img src="/logo/gc2_logo.png">
		</header>
		<div class="tweetlist">
EOM;

$data = get("/api/v1/timelines/public");
foreach ($data as $TweetData){
	PrintTweet($TweetData);
}

echo <<<EOM
		</div>
	</body>
</html>
EOM;
?>
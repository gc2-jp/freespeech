# frozen_string_literal: true

module Avl::AvlStreamInfoHelper
  PROTOCOL_RTS = "artc"
  PROTOCOL_M3U8 = "https"
  PROTOCOL_RTMP = "rtmp"

  STREAM_NAME_PREFIX = "stream"

  def generateStreamAuthKey(appName, streamName, primaryKey, validityPeriodSeconds)
    urlPath = "/" + appName + "/" + streamName
    currentTimeSeconds = Time.now.to_i
    validityTimestamp = currentTimeSeconds + validityPeriodSeconds
    authKeyHashSource = urlPath + "-" + validityTimestamp.to_s + "-0-0-" + primaryKey
    authKeyHash = Digest::MD5.hexdigest(authKeyHashSource)
    return validityTimestamp.to_s + "-0-0-" + authKeyHash
  end

  def generateStreamUrl(protocolName, domainName, appName, streamName, primaryKey, validityPeriodSeconds)
    pushAuthKey = generateStreamAuthKey appName, streamName, primaryKey, validityPeriodSeconds
    return "#{protocolName}://#{domainName}/#{appName}/#{streamName}?auth_key=#{pushAuthKey}"
  end

  def generateStreamName (streamId)
    streamName = STREAM_NAME_PREFIX + streamId
  end

  def generatePushStreamUrl (protocolName, streamName)
    return generateStreamUrl protocolName, ENV["AVL_PUSH_DOMAIN"], ENV["AVL_APP_NAME"], streamName, ENV["AVL_PUSH_AUTH_PRIMARY_KEY"], ENV["AVL_PUSH_AUTH_VALIDITY_PERIOD"].to_i
  end

  def generatePullStreamUrl (protocolName, streamName)
    return generateStreamUrl protocolName, ENV["AVL_PULL_DOMAIN"], ENV["AVL_APP_NAME"], streamName, ENV["AVL_PULL_AUTH_PRIMARY_KEY"], ENV["AVL_PULL_AUTH_VALIDITY_PERIOD"].to_i
  end

  def generateRtcPushStreamUrl (streamId)
    streamName = STREAM_NAME_PREFIX + streamId
    return generatePushStreamUrl PROTOCOL_RTS, streamName
  end

  def generateM3u8PullStreamUrl (streamId)
    # streamName = STREAM_NAME_PREFIX + streamId + '.m3u8';

    # hardcoded to '_HD' until we figure out multi bitrate transcoding permanent settings for HLS with Apsara support
    # requires multi bitrate transcoding template with name 'HD' (defined in Apsara console for pull stream)
    streamName = STREAM_NAME_PREFIX + streamId + '_HD' + '.m3u8';
    return generatePullStreamUrl PROTOCOL_M3U8, streamName
  end

  def generateRtmpPullStreamUrl (streamId)
    # streamName = STREAM_NAME_PREFIX + streamId;

    # hardcoded to '_HD' until we figure out multi bitrate transcoding permanent settings for HLS with Apsara support
    # requires multi bitrate transcoding template with name 'HD' (defined in Apsara console for pull stream)
    streamName = STREAM_NAME_PREFIX + streamId + '_HD';
    return generatePullStreamUrl PROTOCOL_RTMP, streamName
  end
end

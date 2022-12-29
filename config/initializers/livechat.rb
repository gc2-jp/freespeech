# frozen_string_literal: true

Rails.application.configure do
  config.x.firebase_databaseurl = ENV['FIREBASE_DATABASEURL']
end

# frozen_string_literal: true

class TransactionsController < ApplicationController
  def index
    # file_content = "#{Rails.root}/config/transactions/content.yaml"
    # if File.file?(file_content)
    #   content = YAML.load_file(file_content)
    #   # puts content
    #   @body = content['body']
    #   @script = content['js']
    # end
    file_content = "#{Rails.root}/config/transactions/index.html"
    if File.file?(file_content)
      @body = File.read(file_content)
    end
  end
end


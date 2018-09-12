# -*- encoding: utf-8 -*-
# stub: fastlane-plugin-increment_version_code 0.4.3 ruby lib

Gem::Specification.new do |s|
  s.name = "fastlane-plugin-increment_version_code"
  s.version = "0.4.3"

  s.required_rubygems_version = Gem::Requirement.new(">= 0") if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib"]
  s.authors = ["Jems"]
  s.date = "2017-05-31"
  s.email = "jeremy.toudic@gmail.com"
  s.homepage = "https://github.com/Jems22/fastlane-plugin-increment_version_code"
  s.licenses = ["MIT"]
  s.rubygems_version = "2.2.2"
  s.summary = "Increment the version code of your android project."

  s.installed_by_version = "2.2.2" if s.respond_to? :installed_by_version

  if s.respond_to? :specification_version then
    s.specification_version = 4

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
      s.add_development_dependency(%q<pry>, [">= 0"])
      s.add_development_dependency(%q<bundler>, [">= 0"])
      s.add_development_dependency(%q<rspec>, [">= 0"])
      s.add_development_dependency(%q<rake>, [">= 0"])
      s.add_development_dependency(%q<rubocop>, [">= 0"])
      s.add_development_dependency(%q<fastlane>, [">= 1.99.0"])
    else
      s.add_dependency(%q<pry>, [">= 0"])
      s.add_dependency(%q<bundler>, [">= 0"])
      s.add_dependency(%q<rspec>, [">= 0"])
      s.add_dependency(%q<rake>, [">= 0"])
      s.add_dependency(%q<rubocop>, [">= 0"])
      s.add_dependency(%q<fastlane>, [">= 1.99.0"])
    end
  else
    s.add_dependency(%q<pry>, [">= 0"])
    s.add_dependency(%q<bundler>, [">= 0"])
    s.add_dependency(%q<rspec>, [">= 0"])
    s.add_dependency(%q<rake>, [">= 0"])
    s.add_dependency(%q<rubocop>, [">= 0"])
    s.add_dependency(%q<fastlane>, [">= 1.99.0"])
  end
end

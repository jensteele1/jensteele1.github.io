---
layout: archive
title: "Research"
permalink: /research/
author_profile: true
---


{% include base_path %}

{% assign ordered_pages = site.research | sort: "order_number" %}

{% for post in ordered_pages %}
  {% include archive-single.html type="grid" %}
{% endfor %}

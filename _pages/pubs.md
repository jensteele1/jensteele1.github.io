---
layout: archive
title: "Publications"
permalink: /publications/
author_profile: true
---

{% include base_path %}

{% assign ordered_pages = site.publications | sort:"order_number" %}

{% for post in ordered_pages %}
  {% include archive-single.html type="grid" %}
{% endfor %}

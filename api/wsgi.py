#!/usr/bin/python

import cherrypy

class Root:
	def __init__(self):
		print "init"

	@cherrypy.expose
	def index(self, *args, **kwargs):
		print "default"
		return "hi";

def application(environ, start_response):
	print "app"
	cherrypy.config.update({
		'tools.sessions.on': True,
		'tools.sessions.storage_type': 'ram',
		'tools.sessions.timeout': 60,
		'tools.CORS.on': True,
		'environment': 'embedded'
	});
	cherrypy.tree.mount(Root(), script_name = 'wacky-tracky API', config=None)

	return cherrypy.tree(environ, start_response);

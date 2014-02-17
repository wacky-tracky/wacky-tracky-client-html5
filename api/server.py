#!/usr/bin/python

import cherrypy

class Api(object):
	@cherrypy.expose
	def default(self, *args, **kwargs):
		return "Default handler."

cherrypy.quickstart(Root())

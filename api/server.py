#!/usr/bin/python

import cherrypy
from cherrypy._cperror import HTTPError
from cherrypy.lib import sessions
import wrapper
import json
import random
import os

from py2neo.neo4j import Direction

jsonContentType = [('Content-Type', 'application/json')]

class Api(object):
	wrapper = wrapper.Wrapper()

	@cherrypy.expose
	def tag(self, *path, **args):
		if self.wrapper.hasItemGotTag(int(args['item']), int(args['tag'])):
			self.wrapper.untag(int(args['item']), int(args['tag']));
		else:
			self.wrapper.tag(int(args['item']), int(args['tag']));

#	@cherrypy.expose
#	def default(self, *args, **kwargs):
#		return "Index"

	def outputJson(self, structure):
		cherrypy.response.headers['Content-Type'] = 'application/json'

		return json.dumps(structure);

	@cherrypy.expose
	def createTag(self, *path, **args):
		self.wrapper.createTag(args['title'])

	@cherrypy.expose
	def listTags(self, *path, **args):
		tags = self.wrapper.getTags();

		ret = []

		for row in tags:
			singleTag = row[0]

			ret.append({
				"id": singleTag.id,
				"title": singleTag['title']
			});

		return self.outputJson(ret);

	@cherrypy.expose
	def listLists(self, *path, **args):
		lists = self.wrapper.getLists();

		ret = []

		for row in lists:
			singleList = row[0]

			ret.append({
				"id": singleList.id,
				"title": singleList['title'],
				"count": len(singleList.get_related_nodes(Direction.OUTGOING))
			})

		return self.outputJson(ret)

	@cherrypy.expose
	def createList(self, *path, **args):
		self.wrapper.createList(args["title"]);

	@cherrypy.expose
	def createTask(self, *path, **args):
		if (args['parentType'] == "list"):
			createdItems = self.wrapper.createListItem(int(args['parentId']), args['content'])
		else:
			createdItems = self.wrapper.createSubItem(int(args['parentId']), args['content'])

		for row in createdItems:
			item = row[0]

			return self.outputJson(self.normalizeItem(item));


	def getItemTags(self, singleItem):
		ret = []

		for tag in singleItem.get_related_nodes(Direction.EITHER, "tagged"):
			ret.append({
				"id": tag.id,
				"title": tag['title']
			});

		return ret;

	def normalizeItem(self, singleItem):
		return {
			"hasChildren": (len(singleItem.get_related_nodes(Direction.OUTGOING, 'owns')) > 0),
			"content": singleItem['content'],
			"tags": self.getItemTags(singleItem),
			"id": singleItem.id
		}

	@cherrypy.expose
	def listTasks(self, *path, **args):
		if "task" in args:
			items = self.wrapper.getSubItems(int(args['task']))
		else:
			items = self.wrapper.getItemsFromList(int(args['list']))

		ret = []
		for row in items: 
			singleItem = row[0]

			ret.append(self.normalizeItem(singleItem))

		return self.outputJson(ret);

	@cherrypy.expose
	def deleteTask(self, *path, **args):
		self.wrapper.deleteTask(int(args['id']))

	@cherrypy.expose
	def deleteList(self, *path, **args):
		self.wrapper.deleteList(int(args['id']));

	def outputJsonError(self, code, msg):
		cherrypy.response.status = code;

		return self.outputJson({
			"type": "Error",
			"message": msg
		})

	@cherrypy.expose
	def authenticate(self, *path, **args):
		user, password = api.wrapper.getUser();

		if user == None:
			return self.outputJsonError(403, "User not found: " + api.wrapper.username)

		print password
		print args['password']
		
		if args['password'] != password:
			return self.outputJsonError(403, "Password is incorrect.")

		cherrypy.session['user'] = user
		return self.outputJson(user);

	def randomWallpaper(self):
		wallpapers = []

		try:
			wallpapers = []
			
			for wallpaper in os.listdir("wallpapers"):
				if wallpaper.endswith(".png") or wallpaper.endswith(".jpg"):
					wallpapers.append(wallpaper)
		except Exception as e:
			print e

		if len(wallpapers) == 0:
			return None
		else:
			return random.choice(wallpapers);

	@cherrypy.expose
	def init(self, *path, **args):
		session = cherrypy.session
		session['guest'] = True;
		session.save();

		return self.outputJson({
			"wallpaper": self.randomWallpaper()
		});
		
def CORS():
	cherrypy.response.headers['Access-Control-Allow-Origin'] = "*"

api = Api();
api.wrapper.username = "auser"

cherrypy.config.update({
	'server.socket_host': '0.0.0.0',
	'server.socket_port': 8082,
	'tools.sessions.on': True,
	'tools.sessions.storage_type': 'file',
	'tools.sessions.storage_path': './sessions',
	'tools.sessions.timeout': 60,
	'tools.CORS.on': True,
	'sessionFilter.cookie_domain': 'technowax.net:8080',
});
cherrypy.tools.CORS = cherrypy.Tool('before_handler', CORS);
cherrypy.quickstart(api)

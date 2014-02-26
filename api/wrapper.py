#!/usr/bin/python

from py2neo import neo4j, cypher

class Wrapper:
	def __init__(self):
		self.graphdb = neo4j.GraphDatabaseService()

	def createUser(self, username):
		results, metadata = cypher.execute(self.graphdb, "CREATE (u:User {username: {username}})", params = [["username", username]])

	def getUsers(self):
		results, metadata = cypher.execute(self.graphdb, "MATCH (u:User) RETURN u");

		return results;

	def createList(self, username, title):
		results, metadata = cypher.execute(self.graphdb, "MATCH (u:User) WHERE u.username = {username} CREATE (u)-[:owns]->(l:List {title: {title}})", params = [["title", title], ["username", username]]);

	def getLists(self, username):
		results, metadata = cypher.execute(self.graphdb, "MATCH (u:User)-[]->(l:List) WHERE u.username = {username} RETURN l ORDER BY l.title", params = [["username", username]]);

		return results;

	def getTags(self, username):
		results, metadata = cypher.execute(self.graphdb, "MATCH (u:User)-[]->(t:Tag) WHERE u.username = {username} RETURN t ", params = [["username", username]]);

		return results;

	def createTag(self, title, username):
		results, metadata = cypher.execute(self.graphdb, "MATCH (u:User) WHERe u.username = {username} CREATE (u)-[:owns]->(t:Tag {title: {title}}) ", params = [["username", username], ["title", title]]);

	def createListItem(self, listId, content):
		results, metadata = cypher.execute(self.graphdb, "MATCH (l:List) WHERE id(l) = {listId} CREATE (l)-[:owns]->(i:Item {content: {content}}) RETURN i", params = [["listId", listId], ["content", content]])

		return results

	def createSubItem(self, itemId, content):
		results, metadata = cypher.execute(self.graphdb, "MATCH (i:Item) WHERE id(i) = {itemId} CREATE i-[:owns]->(ni:Item {content: {content}}) RETURN ni", params = [["itemId", itemId], ["content", content]]);

		return results

	def getItemsFromList(self, listId):
		results, metadata = cypher.execute(self.graphdb, "MATCH (l:List)-[]->(i:Item) WHERE id(l) = {listId} RETURN i ORDER BY i.content ", params = [["listId", listId]]);

		return results

	def getSubItems(self, parentId):
		results, metadata = cypher.execute(self.graphdb, "MATCH (p:Item)-[]->(i:Item) WHERE id(p) = {parentId} RETURN i ", params = [["parentId", parentId]]);

		return results

	def deleteTask(self, itemId):
		results, metadata = cypher.execute(self.graphdb, "MATCH (i:Item) WHERE id(i) = {itemId} OPTIONAL MATCH (i)<-[r]-() OPTIONAL MATCH (i)-[linkTagged:tagged]->(tag:Tag) DELETE i,r, linkTagged, tag", params = [["itemId", itemId]])

	def deleteList(self, itemId):
		results, metadata = cypher.execute(self.graphdb, "MATCH (l:List) WHERE id(l) = {listId} OPTIONAL MATCH (l)<-[userLink]-() DELETE l, userLink", params = [["listId", itemId]]);

	def tag(self, itemId, tagId):
		results, metadata = cypher.execute(self.graphdb, "MATCH (i:Item), (t:Tag) WHERE id(i) = {itemId} AND id(t) = {tagId} CREATE UNIQUE (i)-[:tagged]->(t) ", params = [["tagId", tagId], ["itemId", itemId]]);

	def untag(self, itemId, tagId):
		results, metadata = cypher.execute(self.graphdb, "MATCH (i:Item)-[link:tagged]->(t:Tag) WHERE id(i) = {itemId} AND id(t) = {tagId} DELETE link ", params = [["itemId", itemId], ["tagId", tagId]]);

	def hasItemGotTag(self, itemId, tagId):
		results, metadata = cypher.execute(self.graphdb, "MATCH (i:Item)-[r]->(t:Tag) WHERE id(i) = {itemId} AND id(t) = {tagId} RETURN r", params = [["itemId", itemId], ["tagId", tagId]]);

		return len(results) > 0

	def register(self, username, hashedPassword, email):
		user, password = self.getUser(username);

		if user != None:
			raise Exception("User already exists")

		results, metadata = cypher.execute(self.graphdb, "CREATE (u:User {username: {username}, password: {password}, email: {email}}) ", params = [["username", username], ["password", hashedPassword], ["email", email]])

		return;

	def getUser(self, username = None):
		if username == None:
			username = username

		results, metadata = cypher.execute(self.graphdb, "MATCH (u:User) WHERE u.username = {username} RETURN u LIMIT 1", params = [["username", username]]);

		if len(results) == 0:
			return [None, None]
		else: 
			for row in results:
				user = row[0]

				return [{
					"username": user['username'],
				}, user['password']]

#!/usr/bin/python

from py2neo import neo4j, cypher

class Wrapper:
	def __init__(self):
		self.graphdb = neo4j.GraphDatabaseService()
		self.username = None

	def createUser(self):
		results, metadata = cypher.execute(self.graphdb, "CREATE (u:User {username: {username}})", params = [["username", self.username]])

	def getUsers(self):
		results, metadata = cypher.execute(self.graphdb, "MATCH (u:User) RETURN u");

		return results;

	def createList(self, title):
		results, metadata = cypher.execute(self.graphdb, "MATCH (u:User) WHERE u.username = {username} CREATE (u)-[:owns]->(l:List {title: {title}})", params = [["title", title], ["username", self.username]]);

	def getLists(self):
		results, metadata = cypher.execute(self.graphdb, "MATCH (u:User)-[]->(l:List) WHERE u.username = {username} RETURN l ORDER BY l.title", params = [["username", self.username]]);

		return results;

	def createListItem(self, listId, content):
		results, metadata = cypher.execute(self.graphdb, "MATCH (l:List) WHERE id(l) = {listId} CREATE (l)-[:owns]->(i:Item {content: {content}})", params = [["listId", listId], ["content", content]])

	def createSubItem(self, itemId, content):
		results, metadata = cypher.execute(self.graphdb, "MATCH (i:Item) WHERE id(i) = {itemId} CREATE i-[:owns]->(ni:Item {content: {content}})", params = [["itemId", listId], ["content", content]]);

	def getItemsFromList(self, listId):
		results, metadata = cypher.execute(self.graphdb, "MATCH (l:List)-[]->(i:Item) WHERE id(l) = {listId} RETURN i ORDER BY i.content ", params = [["listId", listId]]);

		return results

	def deleteTask(self, itemId):
		results, metadata = cypher.execute(self.graphdb, "MATCH (i:Item) WHERE id(i) = {itemId} OPTIONAL MATCH (i)<-[r]-() DELETE i,r ", params = [["itemId", itemId]])

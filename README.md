wacky-tracky
===

An open source list, for to-do's, projects and stuff. It aims to be functionally superior than Astrid, Remember the Milk and Wunderlist. 

Installation
===

1. wacky-tracky uses a graph database called Neo4j for it's data storage. (Tested for community version 2.0.1 for unix) URL: http://www.neo4j.org/ 

2. Start Neo4j (Tested with JAVA version 1.7.0_25) based on README.txt file in the NEO4J_INSTALL/bin folder. Normally, you just need to do;

	`./bin/neo4j start`

3. Download and install Apache HTTPD server for hosting the index.html, javascript and resources.

	Fedora/RHEL

	`sudo yum install httpd`

	Debian/Ubuntu

	`sudo apt-get install apache2`

	More detaild can be found here: http://httpd.apache.org/download.cgi 

4. Create a softlink to the folder where wacky-tracky code. The command should look something like the following:

	`ln -s <git_cloned_repo>/wacky-tracky /var/www/html/wacky-tracky` 

5. Start Apache HTTPD server be using command as follows:

	`service httpd start`

6. Install following packages:

- `python-py2neo` which is a simple Python library that provides access to Neo4j
- `python-cherrypy` which allows developers to build web applications in much the same way they would build any other object-oriented Python program. This usually results in smaller source code developed in less time.

	Fedora/RHEL

	`sudo yum install python-cherrypy python-py2neo`

7. Start python server that hosts the Wacky Tracky API, using the following command:

	`<git_cloned_repo>/api/server.py`

8. NOTE: This should startup the following 3 servers for you and simple tests can be performed as follows:

- Neo4j (Database): http://localhost:7474/ 
- Python Server (API): http://localhost:8082
- Apache HTTPD (Index, resources, javascript client): http://localhost/wacky-tracky/


ENJOY and GOOD LUCK :-))


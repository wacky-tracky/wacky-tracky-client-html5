#########################
INSTALLATION STEPS:
#########################

1. Download Neo4j (Tested for community version 2.0.1 for unix) 
URL: http://www.neo4j.org/ 

2. Start Neo4j (Tested with JAVA version 1.7.0_25) based on README.txt file in the NEO4J_INSTALL/bin folder

3. Download and install Apache HTTPD server. More detaild can be found here:
http://httpd.apache.org/download.cgi 

4. Create a softlink to the folder where wacky-tracky code. The command should look something like the following:

ln -s <git_cloned_repo>/wacky-tracky /var/www/html/wacky-tracky 

5. Start Apache HTTPD server be using command as follows:

service httpd start

6. Install following packages:
- "python-py2neo" which is a simple Python library that provides access to Neo4j
- "python-cherrypy" which allows developers to build web applications in much the same way they would build any other object-oriented Python program. This usually results in smaller source code developed in less time.

7. Start python server using the following command:

<git_cloned_repo>/api/server.py 


NOTE: This should startup the following 3 servers for you and simple tests can be performed as follows:
- Neo4j: http://localhost:7474/ 
- Apache HTTPD: http://localhost/ 
- Python Server: http://localhost/wacky-tracky/ 


ENJOY and GOOD LUCK :-))


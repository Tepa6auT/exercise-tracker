# [Exercise Tracker](https://boilerplate-project-exercisetracker.tepa6aut.repl.co/)

Microservice for people to register and keep track of their exercise activities

# Functionality

Create a new User: 
  requires a username, responds with unique user ID 

Add exercises: 
  requires unique user ID, description, and optionally duration and date, if no date is passed - current date will be used

Query parameters "/api/exercise/log?{userId}[&from][&to][&limit]": 
  /log?{userID} - will respond with user data with an array of exercises
  /log?{userID}[&from][&to][&limit] - will respond with user data with an array of exercises which have a date between "from" and "to". The limit parameter will show only N amount   of exercises
  
  

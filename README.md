rainmap
==============

An API server to return realtime rain map using tenki.jp 

````
export MAP_FROM=29102_12901
export MAP_TO=29105_12904
export RAINMAP_FROM=14552_6450
export RAINMAP_TO=14553_6451
node index.js
````

access with the timedate

````
# 2018/09/11 00:50
http://localhost:8080/20180911/0050.png
````
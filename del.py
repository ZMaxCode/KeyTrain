from databaseModule import Database
from datetime import datetime
import hashlib

database = Database( 'database.db' ).connect()
database.dropTables()
database.createTables()
token0 = database.addUser( 'admin', 'admin' ).login( 'admin', 'admin' )
token1 = database.addUser( 'FroZo', '123' ).login( 'FroZo', '123' ) # 1
token2 = database.addUser( 'MZuk', 'MZuk' ).login( 'MZuk', 'MZuk' )     # 2
database.addText( token0, 'Давай проверим твою скорость печати' )

database.cursor.execute( 'select * from users' )
print( database.cursor.fetchall(), '\n' )

database.cursor.execute( 'select * from texts' )
print( database.cursor.fetchall(), '\n' )

database.cursor.execute( 'select * from scores' )
print( database.cursor.fetchall() )
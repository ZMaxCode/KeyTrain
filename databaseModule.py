import sqlite3
from datetime import datetime
from hashlib import sha1

class Database:
  def __init__( self, databasePath = '' ):
    self.databasePath = databasePath
    self.isConnected = False
  
  def connect( self, databasePath = '' ):
    if databasePath != '': self.databasePath = databasePath
    
    self.connect = sqlite3.connect( self.databasePath )
    self.cursor = self.connect.cursor()
    self.isConnected = True
    
    return self
  
  def createTables( self ):
    if not self.isConnected: return False
    
    self.cursor.execute( '''
      create table if not exists users(
        id integer primary key not null,
        login text not null,
        password text not null,
        token text
      )
    ''' )
    self.cursor.execute( '''
      create table if not exists texts(
        id integer primary key not null,
        userId integer not null,
        txt text not null
      )
    ''' )
    self.cursor.execute( '''
      create table if not exists scores(
        id integer primary key not null,
        userId integer not null,
        textId integer not null,
        score integer not null
      )
    ''' )
    self.connect.commit()
    
    return self
  
  def dropTables( self ):
    if not self.isConnected: return False
    
    self.cursor.execute( 'drop table if exists users' )
    self.cursor.execute( 'drop table if exists texts' )
    self.cursor.execute( 'drop table if exists scores' )
    self.connect.commit()
    
    return self
  
  def addUser( self, login, password ):
    if not self.isConnected: return False
    
    login = login.lower()
    self.cursor.execute( '''
      select id
      from users
      where login = '{}'
    '''.format( login ) )
    
    if len( self.cursor.fetchall() ) == 1: return False
    
    self.cursor.execute( '''
      insert into users(
        login, password
      )
      values( '{}', '{}' )
    '''.format( login, password ) )
    self.connect.commit()
    
    return self
  
  def deleteUser( self, token ):
    if not self.isConnected: return False
    
    self.cursor.execute( '''
      select id
      from users
      where token = '{}'
    '''.format( token ) )
    data = self.cursor.fetchall()
    
    if len( data ) == 0: return False
    
    self.cursor.execute( '''
      select id
      from texts
      where userId = {}
    '''.format( data[0][0] ) )
    textIds = self.cursor.fetchall()
    
    for textId in textIds:
      self.cursor.execute( '''
        delete from scores
        where textId = {}
      '''.format( textId[0] ) )
      self.cursor.execute( '''
        delete from texts
        where id = {}
      '''.format( textId[0] ) )
    
    self.cursor.execute( '''
      delete from scores
      where userId = {}
    '''.format( data[0][0] ) )
    self.cursor.execute( '''
      delete from users
      where id = {}
    '''.format( data[0][0] ) )
    self.connect.commit()
    
    return self
  
  def login( self, login, password ):
    if not self.isConnected: return False
    
    login = login.lower()
    self.cursor.execute( '''
      select id
      from users
      where login = '{}' and password = '{}'
    '''.format( login, password ) )
    
    if len( self.cursor.fetchall() ) == 0: return False
    
    token = sha1( bytes( '{}{}{}'.format( login, password, datetime.now() ), 'utf8' ) ).hexdigest()
    self.cursor.execute( '''
      update users
      set token = '{}'
      where login = '{}'
    '''.format( token, login ) )
    self.connect.commit()
    
    return token
  
  def addText( self, token, txt ):
    if not self.isConnected: return False
    if txt == '': return False
    
    self.cursor.execute( '''
      select id
      from users
      where token = '{}'
    '''.format( token ) )
    data = self.cursor.fetchall()
    
    if len( data ) == 0: return False
    
    self.cursor.execute( '''
      insert into texts(
        userId, txt
      )
      values( {}, '{}' )
    '''.format( data[0][0], txt ) )
    self.connect.commit()
    
    self.cursor.execute( '''
      select max( id )
      from texts
    ''' )
    
    return self.cursor.fetchall()[0][0]
  
  def deleteText( self, token, textId ):
    if not self.isConnected: return False
    
    self.cursor.execute( '''
      select id
      from users
      where token = '{}'
    '''.format( token ) )
    data = self.cursor.fetchall()
    
    if len( data ) == 0: return False
    
    self.cursor.execute( '''
      select id
      from texts
      where id = {} and userId = {}
    '''.format( textId, data[0][0] ) )
    
    if len( self.cursor.fetchall() ) == 0: return False
    
    self.cursor.execute( '''
      delete from scores
      where textId = {}
    '''.format( textId ) )
    self.cursor.execute( '''
      delete from texts
      where id = {} and userId = {}
    '''.format( textId, data[0][0] ) )
    self.connect.commit()
    
    return self
  
  def getTexts( self ):
    if not self.isConnected: return False
    
    self.cursor.execute( '''
      select *
      from texts
    ''' )
    
    return self.cursor.fetchall()
  
  def addScore( self, token, textId, score, isUpdate = True ):
    if not self.isConnected: return False
    
    self.cursor.execute( '''
      select id
      from users
      where token = '{}'
    '''.format( token ) )
    userId = self.cursor.fetchall()
    
    if len( userId ) == 0: return False
    
    self.cursor.execute( '''
      select id
      from texts
      where id = {}
    '''.format( textId ) )
    
    if len( self.cursor.fetchall() ) == 0: return False
    
    userId = userId[0][0]
    self.cursor.execute( '''
      select score
      from scores
      where userId = {} and textId = {}
    '''.format( userId, textId ) )
    data = self.cursor.fetchall()
    
    if len( data ) == 1:
      if isUpdate and data[0][0] < score:
        self.cursor.execute( '''
          update scores
          set score = {}
          where userId = {} and textId = {}
        '''.format( score, userId, textId ) )
        self.connect.commit()
      else: return False
    else:
      self.cursor.execute( '''
        insert into scores(
          userId, textId, score
        )
        values( {}, {}, {} )
      '''.format( userId, textId, score ) )
      self.connect.commit()
    
    return self
  
  def deleteScore( self, token, textId ):
    if not self.isConnected: return False
    
    self.cursor.execute( '''
      select id
      from users
      where token = '{}'
    '''.format( token ) )
    data = self.cursor.fetchall()
    
    if len( data ) == 0: return False
    
    self.cursor.execute( '''
      delete from scores
      where userId = {} and textId = {}
    '''.format( data[0][0], textId ) )
    self.connect.commit()
    
    return self
  
  def getScore( self, token, textId ):
    if not self.isConnected: return False
    
    self.cursor.execute( '''
      select id
      from users
      where token = '{}'
    '''.format( token ) )
    data = self.cursor.fetchall()
    
    if len( data ) == 0: return False
    
    self.cursor.execute( '''
      select score
      from scores
      where userId = {} and textId = {}
    '''.format( data[0][0], textId ) )
    score = self.cursor.fetchall()
    
    if len( score ) == 0: return 0
    
    else: return score[0][0]
import sqlite3
from random import randint
from hashlib import sha1
from datetime import datetime

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
        isAdmin bit not null,
        uuid text
      )
    ''' )
    self.cursor.execute( '''
      create table if not exists texts(
        id integer primary key not null,
        userId integer not null,
        txt text not null,
        isLocal bit not null,
        isOnModeration bit not null
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
  
  # ==================== Methods for work with users ==================== #
  def addUser( self, login, password ):
    if not self.isConnected: return 0
    
    self.cursor.execute( '''
      select id
      from users
      where login = '{}'
    '''.format( login ) )
    
    if len( self.cursor.fetchall() ) == 1: return 1
    
    salt = ''
    
    for i in range( 5 ):
      if randint( 1, 100 ) <= 50: salt += str( randint( 1, 9 ) )
      else: salt += chr( randint( 97, 122 ) )
    
    password = '{};{}'.format( sha1( bytes( '{}{}'.format( password, salt ), 'utf8' ) ).hexdigest(), salt )
    
    self.cursor.execute( '''
      insert into users(
        login, password, isAdmin
      )
      values( '{}', '{}', 0 )
    '''.format( login, password ) )
    self.connect.commit()
    
    return self
  
  def getUserInfoByUUID( self, uuid ):
    if not self.isConnected: return False
    
    self.cursor.execute( '''
      select id, isAdmin, login
      from users
      where uuid = '{}'
    '''.format( uuid ) )
    data = self.cursor.fetchall()
    
    if len( data ) == 0: return False
    
    return data[0]
  
  def changeLogin( self, uuid, login_ ):
    if not self.isConnected: return 0
    
    userInfo = self.getUserInfoByUUID( uuid )
    
    if not userInfo: return 1
    
    self.cursor.execute( '''
      select id
      from users
      where login = '{}'
    '''.format( login_ ) )
    
    if len( self.cursor.fetchall() ) != 0: return 2
    
    self.cursor.execute( '''
      update users
      set login = '{}'
      where id = {}
    '''.format( login_, userInfo[0] ) )
    self.connect.commit()
    
    return login_
  
  def changePassword( self, uuid, oldPassword, newPassword ):
    if not self.isConnected: return 0
    if oldPassword == newPassword: return 1
    
    self.cursor.execute( '''
      select password
      from users
      where uuid = '{}'
    '''.format( uuid ) )
    password = self.cursor.fetchall()
    
    if len( password ) == 0: return 2
    
    password = password[0][0].split( ';' )
    
    if sha1( bytes( '{}{}'.format( oldPassword, password[1] ), 'utf8' ) ).hexdigest() != password[0]: return 3
    
    salt = ''
    
    for i in range( 5 ):
      if randint( 1, 100 ) <= 50: salt += str( randint( 1, 9 ) )
      else: salt += chr( randint( 97, 122 ) )
    
    password = '{};{}'.format( sha1( bytes( '{}{}'.format( newPassword, salt ), 'utf8' ) ).hexdigest(), salt )
    
    self.cursor.execute( '''
      update users
      set password = '{}'
      where uuid = '{}'
    '''.format( password, uuid ) )
    self.connect.commit()
    
    return self
  
  def changeUserStatus( self, uuid, userId, isAdmin ):
    if not self.isConnected: return 0
    
    userInfo = self.getUserInfoByUUID( uuid )
    
    if not userInfo: return 1
    elif userInfo[1] == 0: return 2
    
    if isAdmin: isAdmin = 1
    else: isAdmin = 0
    
    self.cursor.execute( '''
      select isAdmin
      from users
      where id = {}
    '''.format( userId ) )
    data = self.cursor.fetchall()
    
    if len( data ) == 0: return 3
    elif ( isAdmin and data[0][0] == 1 ) or ( not isAdmin and data[0][0] == 0 ): return 4
    
    self.cursor.execute( '''
      update users
      set isAdmin = {}
      where id = {}
    '''.format( isAdmin, userId ) )
    self.connect.commit()
    
    return self
  
  def deleteUser( self, uuid ):
    if not self.isConnected: return 0
    
    userInfo = self.getUserInfoByUUID( uuid )
    
    if not userInfo: return 1
    
    self.cursor.execute( '''
      select id
      from texts
      where userId = {}
    '''.format( userInfo[0] ) )
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
    '''.format( userInfo[0] ) )
    self.cursor.execute( '''
      delete from users
      where id = {}
    '''.format( userInfo[0] ) )
    self.connect.commit()
    
    return self
  
  def login( self, login, password_ ):
    if not self.isConnected: return 0
    
    self.cursor.execute( '''
      select password, isAdmin
      from users
      where login = '{}'
    '''.format( login ) )
    data = self.cursor.fetchall()
    
    if len( data ) == 0: return 1
    
    password = data[0][0].split( ';' )
    isAdmin = data[0][1]
    
    if sha1( bytes( '{}{}'.format( password_, password[1] ), 'utf8' ) ).hexdigest() != password[0]: return 2
    
    uuid = sha1( bytes( '{}{}{}'.format( login, password[1], datetime.now() ), 'utf8' ) ).hexdigest()
    self.cursor.execute( '''
      update users
      set uuid = '{}'
      where login = '{}'
    '''.format( uuid, login ) )
    self.connect.commit()
    
    return [ uuid, isAdmin ]
  
  # ==================== Methods for work with texts ==================== #
  def addText( self, uuid, txt, isLocal = False ):
    if not self.isConnected: return 0
    if txt == '': return -1
    
    userInfo = self.getUserInfoByUUID( uuid )
    
    if not userInfo: return -2
    
    txt = txt.replace( '\'', '\'\'' )
    
    if isLocal:
      isLocal = 1
      isOnModeration = 0
    else:
      isLocal = 0
      
      if userInfo[1] == 0: isOnModeration = 1
      else: isOnModeration = 0
    
    self.cursor.execute( '''
      insert into texts(
        userId, txt, isLocal, isOnModeration
      )
      values( {}, '{}', {}, {} )
    '''.format( userInfo[0], txt, isLocal, isOnModeration ) )
    self.connect.commit()
    
    self.cursor.execute( '''
      select max( id )
      from texts
    ''' )
    
    return self.cursor.fetchall()[0][0]
  
  def acceptOrDeclineText( self, uuid, textId, action ):
    if not self.isConnected: return 0
    
    userInfo = self.getUserInfoByUUID( uuid )
    
    if not userInfo: return 1
    elif userInfo[1] == 0: return 2
    
    self.cursor.execute( '''
      select isLocal, isOnModeration
      from texts
      where id = {}
    '''.format( textId ) )
    textInfo = self.cursor.fetchall()
    self.connect.commit()
    
    if len( textInfo ) == 0: return 3
    
    if textInfo[0][0] == 1: return 4
    elif textInfo[0][1] == 0: return 5
    
    if not action:
      self.cursor.execute( '''
        delete from texts
        where id = {}
      '''.format( textId ) )
    else:
      self.cursor.execute( '''
        update texts
        set isOnModeration = 0
        where id = {}
      '''.format( textId ) )
    
    self.connect.commit()
    
    return self
  
  def deleteText( self, uuid, textId ):
    if not self.isConnected: return 0
    
    userInfo = self.getUserInfoByUUID( uuid )
    
    if not userInfo: return 1
    
    self.cursor.execute( '''
      select userId, isLocal
      from texts
      where id = {}
    '''.format( textId ) )
    data = self.cursor.fetchall()
    
    if len( data ) == 0: return 2
    
    data = data[0]
    
    if data[1] == 1 and data[0] != userInfo[0]: return 3
    elif userInfo[1] == 0 and data[0] != userInfo[0]: return 4
    
    self.cursor.execute( '''
      delete from scores
      where textId = {}
    '''.format( textId ) )
    self.cursor.execute( '''
      delete from texts
      where id = {}
    '''.format( textId ) )
    self.connect.commit()
    
    return self
  
  def getTexts( self, uuid = '' ):
    if not self.isConnected: return 0
    
    self.cursor.execute( '''
      select texts.*, users.login
      from texts, users
      where texts.isLocal = 0 and texts.isOnModeration = 0 and texts.userId = users.id
    ''' )
    texts = [ self.cursor.fetchall() ]
    userInfo = self.getUserInfoByUUID( uuid )
    
    if userInfo != False:
      self.cursor.execute( '''
        select *
        from texts
        where isLocal = 1 and userId = {}
      '''.format( userInfo[0] ) )
      texts.append( self.cursor.fetchall() )
      
      if userInfo[1] == 1:
        self.cursor.execute( '''
          select texts.*, users.login
          from texts, users
          where texts.isOnModeration = 1 and texts.userId = users.id
        ''' )
        texts.append( self.cursor.fetchall() )
    
    return texts
  
  # ==================== Methods for work with scores ==================== #
  def addScore( self, uuid, textId, score, isUpdate = True ):
    if not self.isConnected: return 0
    
    userInfo = self.getUserInfoByUUID( uuid )
    
    if not userInfo: return 1
    
    self.cursor.execute( '''
      select isLocal, isOnModeration, userId
      from texts
      where id = {}
    '''.format( textId ) )
    data = self.cursor.fetchall()
    
    if len( data ) == 0: return 2
    
    data = data[0]
    
    if ( data[0] == 1 and data[2] != userInfo[0] ) or data[1] == 1: return 3
    
    self.cursor.execute( '''
      select score
      from scores
      where userId = {} and textId = {}
    '''.format( userInfo[0], textId ) )
    data = self.cursor.fetchall()
    
    if len( data ) == 1:
      if isUpdate and data[0][0] < score:
        self.cursor.execute( '''
          update scores
          set score = {}
          where userId = {} and textId = {}
        '''.format( score, userInfo[0], textId ) )
        self.connect.commit()
      else: return 4
    else:
      self.cursor.execute( '''
        insert into scores(
          userId, textId, score
        )
        values( {}, {}, {} )
      '''.format( userInfo[0], textId, score ) )
      self.connect.commit()
    
    return self
  
  def deleteScore( self, uuid, textId ):
    if not self.isConnected: return 0
    
    userInfo = self.getUserInfoByUUID( uuid )
    
    if not userInfo: return 1
    
    self.cursor.execute( '''
      delete from scores
      where userId = {} and textId = {}
    '''.format( userInfo[0], textId ) )
    self.connect.commit()
    
    return self
  
  def getScoreByUUIDAndTextId( self, uuid, textId ):
    if not self.isConnected: return 0
    
    userInfo = self.getUserInfoByUUID( uuid )
    
    if not userInfo: return -1
    
    self.cursor.execute( '''
      select score
      from scores
      where userId = {} and textId = {}
    '''.format( userInfo[0], textId ) )
    score = self.cursor.fetchall()
    
    if len( score ) == 0: return -2
    
    return score[0][0]
  
  def getScoresByTextId( self, textId ):
    if not self.isConnected: return 0
    
    self.cursor.execute( '''
      select users.login, scores.score
      from users, scores
      where scores.userId = users.id and scores.textId = {}
      order by scores.score desc
    '''.format( textId ) )
    scores = self.cursor.fetchall()
    
    if len( scores ) == 0: return 1
    
    return scores

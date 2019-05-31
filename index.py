from http.server import HTTPServer, BaseHTTPRequestHandler
import json
from contentTypeModule import getContentType
from parseURLModule import parseURL
from databaseModule import Database

IP = '0.0.0.0'
PORT = 8080
siteFolder = 'site/'
database = Database( 'database.db' ).connect()

def printConnectInfo( requestType, connectInfo, requestURL = None ):
  print( '[{}] New request'.format( requestType.upper() ) )
  print( '  Address: {}:{}'.format( connectInfo[0], connectInfo[1] ) )
  
  if requestURL != None: print( "  Request URL: '{}'".format( requestURL ) )
  
  print()

def getResponse( evnt, message ):
  return { 'event' : evnt, 'message' : message }

class CRequestHandler( BaseHTTPRequestHandler ):
  # GET запрос
  def do_GET( self ):
    self.send_response( 200 )
    
    parsedURL = parseURL( self.path )
    contentType = getContentType( parsedURL[ 'fileExtension' ] )
    self.send_header( 'Content-type', contentType )
    
    self.end_headers()
    
    fileName = parsedURL[ 'fileName' ]
    
    if parsedURL[ 'fileExtension' ] != '': fileName += parsedURL[ 'fileExtension' ]
    
    if fileName == '': filePath = 'index.html'
    elif fileName == 'favicon.ico': pass
    else: filePath = parsedURL[ 'filePath' ] + fileName
    
    printConnectInfo( 'get', self.client_address, self.path )
    
    if fileName != 'favicon.ico' and fileName != 'database.db':
      try:
        response = open( siteFolder + filePath, 'rb' ).read()
      except:
        try:
          response = open( siteFolder + 'badPage.html', 'rb' ).read()
        except:
          response = bytes( 'Bad page', 'utf8' )
    else: response = bytes( '', 'utf8' )
    
    self.wfile.write( response )
  
  # POST запрос
  def do_POST( self ):
    self.send_response( 200 )
    
    self.end_headers()
    
    data = self.rfile.read( int( self.headers[ 'Content-Length' ] ) ).decode( 'utf8' )
    
    if data != '': data = json.loads( data )
    if not 'dict' in str( type( data ) ): data = {}
    
    printConnectInfo( 'post', self.client_address )
    
    if 'event' in data:
      evnt = data[ 'event' ]
      
      # ==================== Methods for work with users ==================== #
      # Register
      if evnt == 'add user':
        result = database.addUser( data[ 'login' ], data[ 'password' ] )
        
        if result == 0: response = getResponse( 'error', 'Database not connected' )
        elif result == 1: response = getResponse( 'error', 'User "{}" already exists'.format( data[ 'login' ] ) )
        else: response = getResponse( 'success', 'User "{}" successfully registered'.format( data[ 'login' ] ) )
      # Check user
      elif evnt == 'check user':
        result = database.getUserInfoByUUID( data[ 'uuid' ] )
        
        if not result: response = getResponse( 'error', 'Invalid UUID' )
        else: response = getResponse( 'success', result[ 1: ] )
      # Change login
      elif evnt == 'change login':
        result = database.changeLogin( data[ 'uuid' ], data[ 'password' ], data[ 'login' ] )
        
        if result == 0: response = getResponse( 'error', 'Database not connected' )
        elif result == 1: response = getResponse( 'error', 'Invalid UUID' )
        elif result == 2: response = getResponse( 'error', 'Invalid password' )
        elif result == 3: response = getResponse( 'error', 'User with login "{}" already exists'.format( data[ 'login' ] ) )
        else: response = getResponse( 'success', result )
      # Change password
      elif evnt == 'change password':
        result = database.changePassword( data[ 'uuid' ], data[ 'oldPassword' ], data[ 'newPassword' ] )
        
        if result == 0: response = getResponse( 'error', 'Database not connected' )
        elif result == 1: response = getResponse( 'error', 'Passwords match' )
        elif result == 2: response = getResponse( 'error', 'Invalid UUID' )
        elif result == 3: response = getResponse( 'error', 'Invalid password' )
        else: response = getResponse( 'success', 'Password changed successfully' )
      # Change user status
      elif evnt == 'change user status':
        result = database.changeUserStatus( data[ 'uuid' ], data[ 'userId' ], data[ 'isAdmin' ] )
        
        if result == 0: response = getResponse( 'error', 'Database not connected' )
        elif result == 1: response = getResponse( 'error', 'Invalid UUID' )
        elif result == 2: response = getResponse( 'error', 'You isn\'t admin' )
        elif result == 3: response = getResponse( 'error', 'User don\'t exists' )
        elif result == 4: response = getResponse( 'error', 'User status already corresponds to the transmitted' )
        else: response = getResponse( 'success', 'Status changed successfully' )
      # Delete user
      elif evnt == 'delete user':
        result = database.deleteUser( data[ 'uuid' ] )
        
        if result == 0: response = getResponse( 'error', 'Database not connected' )
        elif result == 1: response = getResponse( 'error', 'Invalid UUID' )
        else: response = getResponse( 'success', 'User deleted successfully' )
      # Login
      elif evnt == 'login':
        result = database.login( data[ 'login' ], data[ 'password' ] )
        
        if result == 0: response = getResponse( 'error', 'Database not connected' )
        elif result == 1: response = getResponse( 'error', 'User with login "{}" doesn\'t exists'.format( data[ 'login' ] ) )
        elif result == 2: response = getResponse( 'error', 'Invalid password' )
        else: response = getResponse( 'success', result )
      # Get user
      elif evnt == 'get user':
        result = database.getUser( data[ 'uuid' ], data[ 'login' ] )
        
        if result == 0: response = getResponse( 'error', 'Database not connected' )
        elif result == 1: response = getResponse( 'error', 'Invalid UUID' )
        elif result == 2: response = getResponse( 'error', 'You isn\'t admin' )
        elif result == 3: response = getResponse( 'error', 'User with login "{}" doesn\'t exists'.format( data[ 'login' ] ) )
        else: response = getResponse( 'success', result )
      # ==================== Methods for work with texts ==================== #
      # Add text
      elif evnt == 'add text':
        if 'isLocal' in data: result = database.addText( data[ 'uuid' ], data[ 'text' ], data[ 'isLocal' ] )
        else: result = database.addText( data[ 'uuid' ], data[ 'text' ] )
        
        if result == 0: response = getResponse( 'error', 'Database not connected' )
        elif result == -1: response = getResponse( 'error', 'Empty text' )
        elif result == -2: response = getResponse( 'error', 'Invalid UUID' )
        else: response = getResponse( 'success', result )
      # Accept or decline text
      elif evnt == 'accept or decline text':
        result = database.acceptOrDeclineText( data[ 'uuid' ], data[ 'textId' ], data[ 'action' ] )
        
        if result == 0: response = getResponse( 'error', 'Database not connected' )
        elif result == 1: response = getResponse( 'error', 'Invalid UUID' )
        elif result == 2: response = getResponse( 'error', 'You isn\'t admin' )
        elif result == 3: response = getResponse( 'error', 'Text not found' )
        elif result == 4: response = getResponse( 'error', 'Text is local' )
        elif result == 5: response = getResponse( 'error', 'Text isn\'t on moderation' )
        else: response = getResponse( 'success', 'Text successfully accepted or declined' )
      # Delete text
      elif evnt == 'delete text':
        result = database.deleteText( data[ 'uuid' ], data[ 'textId' ] )
        
        if result == 0: response = getResponse( 'error', 'Database not connected' )
        elif result == 1: response = getResponse( 'error', 'Invalid UUID' )
        elif result == 2: response = getResponse( 'error', 'Text not found' )
        elif result == 3: response = getResponse( 'error', 'Text is local and you isn\'t owner of this text' )
        elif result == 4: response = getResponse( 'error', 'You don\'t delete other users texts' )
        else: response = getResponse( 'success', 'Text deleted successfully' )
      # Get texts
      elif evnt == 'get texts':
        if 'uuid' in data: result = database.getTexts( data[ 'uuid' ] )
        else: result = database.getTexts()
        
        if result == 0: response = getResponse( 'error', 'Database not connected' )
        else: response = getResponse( 'success', result )
      # ==================== Methods for work with scores ==================== #
      # Add score
      elif evnt == 'add score':
        result = database.addScore( data[ 'uuid' ], data[ 'textId' ], data[ 'score' ] )
        
        if result == 0: response = getResponse( 'error', 'Database not connected' )
        elif result == 1: response = getResponse( 'error', 'Invalid UUID' )
        elif result == 2: response = getResponse( 'error', 'Invalid text id' )
        elif result == 3: response = getResponse( 'error', 'Unable to add points for this text' )
        elif result == 4: response = getResponse( 'error', 'Not the best score' )
        else: response = getResponse( 'success', 'Score add or update successfully' )
      # Get score by UUID and text id
      elif evnt == 'get score by uuid and text id':
        result = database.getScoreByUUIDAndTextId( data[ 'uuid' ], data[ 'textId' ] )
        
        if result == 0: response = getResponse( 'error', 'Database not connected' )
        elif result == -1: response = getResponse( 'error', 'Invalid UUID' )
        elif result == -2: response = getResponse( 'error', 'No points found for this uuid and text id' )
        else: response = getResponse( 'success', result )
      # Get scores by text id
      elif evnt == 'get scores by text id':
        result = database.getScoresByTextId( data[ 'textId' ] )
        
        if result == 0: response = getResponse( 'error', 'Database not connected' )
        elif result == 1: response = getResponse( 'error', 'No scores for this text' )
        else: response = getResponse( 'success', result )
      else: response = getResponse( 'error', 'Undefined event' )
    else:
      response = getResponse( 'error', 'Event doesn\'t sended' )
    
    self.wfile.write( bytes( json.dumps( response ), 'utf8' ) )

server = HTTPServer( ( IP, PORT ), CRequestHandler )
print( 'Server started\n  IP: http://{}:{}'.format( IP, PORT ) )
server.serve_forever()
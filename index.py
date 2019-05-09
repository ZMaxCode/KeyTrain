from http.server import HTTPServer, BaseHTTPRequestHandler
import json
from contentTypeModule import getContentType
from parseURLModule import parseURL
from databaseModule import Database

IP = '0.0.0.0'
PORT = 80
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
    
    if fileName != 'favicon.ico':
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
    
    try:
      evnt = data[ 'event' ]
      
      # Add user to database (register)
      if evnt == 'add user':
        result = database.addUser( data[ 'login' ], data[ 'password' ] )
        
        if not result: response = getResponse( 'error', 'User already exists' )
        else: response = getResponse( 'success', 'User successfully added' )
      # Create new token from login, password and time (login)
      elif evnt == 'login':
        result = database.login( data[ 'login' ], data[ 'password' ] )
        
        if not result: response = getResponse( 'error', "User don't exists" )
        else: response = getResponse( 'success', result )
      # Get all texts
      elif evnt == 'get texts': response = getResponse( 'success', database.getTexts() )
      # Add text
      elif evnt == 'add text':
        result = database.addText( data[ 'token' ], data[ 'txt' ] )
        
        if not result: response = getResponse( 'error', 'Error' )
        else: response = getResponse( 'success', result )
      # Get score
      elif evnt == 'get score':
        result = database.getScore( data[ 'token' ], data[ 'textId' ] )

        if ( 'bool' in str( type( result ) ) ) and not result: response = getResponse( 'error', 'Error' )
        else: response = getResponse( 'success', result )
      # Add score
      elif evnt == 'set score':
        result = database.addScore( data[ 'token' ], data[ 'textId' ], data[ 'score' ] )

        if not result: response = getResponse( 'error', 'Error' )
        else: response = getResponse( 'success', 'Successfully' )
    except:
      response = getResponse( 'error', 'undefined event' )
    
    self.wfile.write( bytes( json.dumps( response ), 'utf8' ) )

server = HTTPServer( ( IP, PORT ), CRequestHandler )
print( 'Server started\n  IP: http://{}:{}'.format( IP, PORT ) )
server.serve_forever()